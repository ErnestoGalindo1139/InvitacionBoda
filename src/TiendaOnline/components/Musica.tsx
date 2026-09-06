import type { JSX } from 'react';
import { useRef, useState } from 'react';
import { assetUrl } from '../helpers/invitacion';
export const Musica = ({
  src,
  titulo,
}: {
  src: string;
  titulo: string;
}): JSX.Element | null => {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  if (!src) return null;
  const toggle = async (): Promise<void> => {
    if (!audio.current) return;
    if (playing) {
      audio.current.pause();
      return;
    }
    try {
      audio.current.volume = 0.35;
      await audio.current.play();
      setError(false);
    } catch {
      setError(true);
    }
  };
  return (
    <div className="music-control">
      <audio
        ref={audio}
        src={assetUrl(src)}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setError(true);
        }}
      />
      <button
        onClick={() => void toggle()}
        aria-pressed={playing}
        aria-label={`${playing ? 'Pausar' : 'Activar'} ${titulo}`}
      >
        {playing ? 'Ⅱ' : '♫'}
      </button>
      {error && <span role="status">No se pudo reproducir la música.</span>}
    </div>
  );
};
