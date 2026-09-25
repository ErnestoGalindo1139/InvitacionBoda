import type { JSX } from 'react';
import { useRef } from 'react';
import { assetUrl } from '../helpers/invitacion';
export const Galeria = ({
  fotos,
}: {
  fotos: { src: string; alt: string }[];
}): JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const move = (direction: number): void => {
    const rail = ref.current;
    if (rail)
      rail.scrollBy({
        left:
          direction *
          ((rail.querySelector('figure')?.getBoundingClientRect().width ??
            rail.clientWidth) +
            parseFloat(getComputedStyle(rail).gap || '0')),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
      });
  };
  return (
    <div className="gallery-wrap">
      <div
        className="gallery"
        ref={ref}
        tabIndex={0}
        aria-label="Galería de fotografías; desliza para explorar"
      >
        {fotos.map((foto, i) => (
          <figure key={foto.src}>
            <img
              src={assetUrl(foto.src)}
              alt={foto.alt}
              loading="lazy"
              decoding="async"
              width="900"
              height="1200"
            />
            <figcaption>
              0{i + 1} <span>Juntos, siempre.</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="gallery-controls">
        <span>Pequeños instantes, un gran amor</span>
        <div>
          <button aria-label="Fotos anteriores" onClick={() => move(-1)}>
            ←
          </button>
          <button aria-label="Fotos siguientes" onClick={() => move(1)}>
            →
          </button>
        </div>
      </div>
    </div>
  );
};
