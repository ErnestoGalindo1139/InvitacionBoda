import { useEffect, useRef, useState, type JSX } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import decode from 'jsqr';
import { passToken } from '../helpers/passToken';

function cameraError(reason: unknown): string {
  const name = reason instanceof Error ? reason.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError')
    return 'Permite el acceso a la cámara en tu navegador y vuelve a intentar.';
  if (name === 'NotFoundError')
    return 'No se encontró una cámara en este dispositivo. Puedes pegar el enlace del QR abajo.';
  if (name === 'NotReadableError')
    return 'El dispositivo no pudo abrir la cámara. Cierra otras aplicaciones que la estén usando y revisa que el navegador tenga permiso para usarla.';
  if (name === 'OverconstrainedError')
    return 'La cámara no admite la configuración solicitada. Prueba otra cámara o consulta el pase con su enlace.';
  if (name === 'AbortError')
    return 'Se interrumpió el inicio de la cámara. Vuelve a intentar y mantén esta página abierta.';
  return 'No se pudo iniciar el lector. Vuelve a intentar o pega el enlace del QR abajo.';
}

export function QrScanner({
  disabled,
  onRead,
  onStart,
}: {
  disabled: boolean;
  onRead: (token: string) => void;
  onStart: () => void;
}): JSX.Element {
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const video = useRef<HTMLVideoElement>(null);
  const read = useRef(onRead);
  useEffect(() => {
    if (disabled) {
      setActive(false);
      setMessage('');
    }
  }, [disabled]);
  useEffect(() => {
    read.current = onRead;
  }, [onRead]);
  useEffect(() => {
    if (!active || disabled) return;
    let cancelled = false;
    let stream: MediaStream | undefined;
    let frame = 0;
    const preview = video.current;
    const stop = (): void => {
      cancelled = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((track) => track.stop());
      if (preview) preview.srcObject = null;
    };
    async function start(): Promise<void> {
      let stage = 'camera';
      try {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
          });
        } catch (reason) {
          if (cancelled) return;
          if (
            !(reason instanceof Error) ||
            ![
              'NotReadableError',
              'OverconstrainedError',
              'AbortError',
            ].includes(reason.name)
          )
            throw reason;
          // Some devices cannot start the preferred rear camera or resolution.
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true,
          });
        }
        if (cancelled || !preview) {
          stop();
          return;
        }
        preview.srcObject = stream;
        preview.muted = true;
        stage = 'preview';
        await preview.play();
        if (cancelled) return;
        setMessage(
          'Apunta la cámara al QR del pase. La consulta se hará automáticamente.'
        );
        const canvas = document.createElement('canvas');
        stage = 'decoder';
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('No se pudo leer la imagen de la cámara.');
        let lastScan = 0;
        const scan = (now: number): void => {
          if (cancelled) return;
          if (
            now - lastScan >= 180 &&
            preview.readyState >= 2 &&
            preview.videoWidth &&
            preview.videoHeight
          ) {
            lastScan = now;
            const scale = Math.min(
              1,
              960 / Math.max(preview.videoWidth, preview.videoHeight)
            );
            const width = Math.round(preview.videoWidth * scale);
            const height = Math.round(preview.videoHeight * scale);
            if (canvas.width !== width) canvas.width = width;
            if (canvas.height !== height) canvas.height = height;
            ctx.drawImage(preview, 0, 0, canvas.width, canvas.height);
            const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = decode(image.data, image.width, image.height, {
              inversionAttempts: 'dontInvert',
            });
            if (code) {
              let token: string;
              try {
                token = passToken(code.data);
              } catch {
                setMessage(
                  'Este QR no corresponde a un pase de la boda. Apunta al QR del pase.'
                );
                frame = requestAnimationFrame(scan);
                return;
              }
              stop();
              setActive(false);
              setMessage('QR leído. Consultando pase…');
              read.current(token);
              return;
            }
          }
          frame = requestAnimationFrame(scan);
        };
        frame = requestAnimationFrame(scan);
      } catch (reason) {
        if (cancelled) return;
        console.error(`No se pudo iniciar el lector QR (${stage}).`, reason);
        stop();
        setActive(false);
        setMessage('');
        setError(
          stage === 'preview'
            ? 'La cámara se abrió, pero el navegador no pudo mostrarla. Abre el enlace directamente en Chrome o Safari y vuelve a intentar.'
            : cameraError(reason)
        );
      }
    }
    void start();
    return stop;
  }, [active, disabled]);
  function open(): void {
    setError('');
    setMessage('');
    if (!window.isSecureContext) {
      setError(
        'Para usar la cámara, abre el sistema con HTTPS. En esta computadora también funciona con localhost.'
      );
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        'Este navegador no permite usar la cámara. Prueba otro navegador o pega el enlace del QR abajo.'
      );
      return;
    }
    setMessage('Abriendo cámara… Si el navegador lo pide, permite el acceso.');
    onStart();
    setActive(true);
  }
  return (
    <div className="qr-scanner">
      <div className="system-actions">
        {active && !disabled ? (
          <button
            type="button"
            onClick={() => {
              setActive(false);
              setMessage('');
            }}
          >
            <CameraOff size={18} aria-hidden="true" /> Detener cámara
          </button>
        ) : (
          <button
            className="system-primary"
            type="button"
            disabled={disabled}
            onClick={open}
          >
            <Camera size={18} aria-hidden="true" /> Escanear QR
          </button>
        )}
      </div>
      {active && !disabled && (
        <div className="qr-camera-preview">
          <video
            ref={video}
            autoPlay
            muted
            playsInline
            aria-label="Cámara para escanear el QR del pase"
          />
          <div className="qr-camera-guide" aria-hidden="true" />
        </div>
      )}
      {message && (
        <p className="system-help" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="system-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
