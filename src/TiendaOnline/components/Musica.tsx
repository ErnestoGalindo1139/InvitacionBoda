import type { JSX, RefObject } from 'react';
import { useState } from 'react';
import { assetUrl } from '../helpers/invitacion';
export const Musica = ({
  src,
  titulo,
  audioRef,
}: {
  src: string;
  titulo: string;
  audioRef: RefObject<HTMLAudioElement>;
}): JSX.Element | null => {
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  if (!src) return null;
  const toggle = async (): Promise<void> => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      return;
    }
    try {
      audioRef.current.volume = 0.25;
      await audioRef.current.play();
      setError(false);
    } catch {
      setError(true);
    }
  };
  return (
    <div className="music-control">
      <audio
        ref={audioRef}
        src={assetUrl(src)}
        loop
        preload="metadata"
        onLoadedMetadata={(event) => {
          event.currentTarget.currentTime = 5;
        }}
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
