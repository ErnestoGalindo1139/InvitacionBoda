import { useEffect, useRef, useState, type JSX } from 'react';
import QRCode from 'qrcode';
import type { Pass } from '../helpers/api';
import { errorMessage } from '../helpers/api';
import { passDetails, passPng } from '../helpers/passDesign';
import { Download, Printer } from 'lucide-react';

export function FamilyPass({ pass }: { pass: Pass }): JSX.Element {
  const printCard = useRef<HTMLDivElement>(null);
  const [qr, setQr] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const details = passDetails(pass);
  useEffect(() => {
    let active = true;
    setQr('');
    setError('');
    // Library runs in this browser; no personal data or tokens go to a QR image service.
    const url = `${window.location.origin}/admin?qr=${encodeURIComponent(pass.nb_TokenQR)}`;
    void QRCode.toDataURL(url, {
      width: 720,
      margin: 4,
      errorCorrectionLevel: 'M',
    })
      .then((data) => {
        if (active) setQr(data);
      })
      .catch(() => {
        if (active)
          setError('No se pudo generar el QR. Recarga para recuperarlo.');
      });
    return (): void => {
      active = false;
    };
  }, [pass.nb_TokenQR]);
  async function download(): Promise<void> {
    setBusy(true);
    setError('');
    try {
      const blob = await passPng(pass, qr);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'pase-de-acceso.png';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setBusy(false);
    }
  }
  function print(): void {
    if (!printCard.current) return;
    document.getElementById('boda-print-root')?.remove();
    const root = document.createElement('div');
    root.id = 'boda-print-root';
    root.className = 'wedding wedding-print-root';
    root.append(printCard.current.cloneNode(true));
    document.body.append(root);
    window.addEventListener('afterprint', () => root.remove(), { once: true });
    window.print();
  }
  return (
    <section className="pass-section" aria-label="Pase de acceso">
      <div ref={printCard} className="family-pass">
        <header className="pass-marquee">
          <div className="pass-film-strip" aria-hidden="true" />
          <div className="pass-title-frame">
            <p className="pass-kicker">Una película de amor</p>
            <h2>{pass.nb_Boda}</h2>
            <p className="pass-subtitle">Nuestro gran estreno</p>
          </div>
          <div className="pass-film-strip" aria-hidden="true" />
        </header>
        <div className="pass-guest">
          <p className="pass-kicker">Invitación para</p>
          <h3>{pass.nb_Persona}</h3>
          <span className="pass-ornament" aria-hidden="true">
            ✦
          </span>
          <p className="pass-date">
            <time dateTime={pass.fh_Boda}>{details.date}</time>
          </p>
          <p className="pass-venue">{details.venue}</p>
          <p className="pass-schedule">Recepción · {details.time}</p>
        </div>
        <div className="pass-perforation" aria-hidden="true" />
        <div className="pass-admission">
          <div className="pass-quantity">
            <p className="pass-kicker">Acceso confirmado</p>
            <p className="pass-count">
              <strong>{pass.nu_PasesConfirmados}</strong>{' '}
              <span>{pass.nu_PasesConfirmados === 1 ? 'pase' : 'pases'}</span>
            </p>
            <p className="pass-small">Para celebrar contigo</p>
          </div>
          <div className="pass-code">
            <div className="pass-qr-frame">
              {qr ? (
                <img
                  className="pass-qr"
                  src={qr}
                  alt="QR del pase de acceso para consulta del organizador"
                  width="196"
                  height="196"
                />
              ) : (
                <p role="status">Preparando QR…</p>
              )}
            </div>
            <p className="pass-folio">Folio {details.reference}</p>
          </div>
        </div>
        <footer className="pass-bottom">
          <p>Una noche para recordar</p>
          <small>Presenta este pase al llegar a la celebración.</small>
        </footer>
      </div>
      {error && (
        <p className="system-error" role="alert">
          {error}
        </p>
      )}
      <div className="system-actions pass-actions no-print">
        <button type="button" disabled={!qr || busy} onClick={print}>
          <Printer size={18} aria-hidden="true" /> Imprimir / guardar PDF
        </button>
        <button
          type="button"
          disabled={!qr || busy}
          className="system-primary"
          onClick={() => void download()}
        >
          <Download size={18} aria-hidden="true" />
          {busy ? 'Descargando…' : 'Descargar pase PNG'}
        </button>
      </div>
    </section>
  );
}
