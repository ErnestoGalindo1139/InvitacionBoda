import {
  Church,
  Heart,
  MoonStar,
  Music2,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from 'lucide-react';
import type { JSX } from 'react';
import { Reveal } from './Reveal';

const icons: Record<string, LucideIcon> = {
  Ceremonia: Church,
  Recepción: Wine,
  Cena: UtensilsCrossed,
  Baile: Music2,
  Cierre: MoonStar,
};

export const Itinerario = ({
  momentos,
}: {
  momentos: { titulo: string; hora: string; descripcion: string }[];
}): JSX.Element => (
  <ol className="timeline" aria-label="Itinerario de la boda">
    {momentos.map((item, i) => {
      const Icon = icons[item.titulo] ?? Heart;
      return (
        <li key={`${item.titulo}-${item.hora}`} data-moment={item.titulo}>
          <Reveal className="timeline-step">
            <span className="timeline-number" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="timeline-copy">
              <span className="eyebrow">{item.hora}</span>
              <h3>{item.titulo}</h3>
              <p>{item.descripcion}</p>
            </div>
            <span className="timeline-icon" aria-hidden="true">
              <span className="timeline-art-number">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="timeline-illustration">
                <svg
                  className="timeline-scene"
                  viewBox="0 0 120 150"
                  fill="none"
                >
                  <path
                    className="scene-arch"
                    d="M12 133V61a48 48 0 0 1 96 0v72"
                  />
                  <path d="M51 28h18M60 19v18m-6-15 12 12m-12 0 12-12" />
                  <path className="scene-ground" d="M26 114h68M38 119h44" />
                  <path d="M19 134c8-2 15-8 19-17m-13 13c-6-1-9-5-10-9 6 0 9 4 10 9Zm7-6c-3-5-2-10 0-13 4 5 4 9 0 13Zm69 10c-8-2-15-8-19-17m13 13c6-1 9-5 10-9-6 0-9 4-10 9Zm-7-6c3-5 2-10 0-13-4 5-4 9 0 13Z" />
                  <path d="M25 55v6m-3-3h6m65 37v6m-3-3h6" />
                </svg>
                <Icon className="timeline-scene-symbol" strokeWidth={1.15} />
                {item.titulo === 'Recepción' && (
                  <Wine
                    className="timeline-scene-symbol timeline-second-glass"
                    strokeWidth={1.15}
                  />
                )}
              </span>
            </span>
          </Reveal>
        </li>
      );
    })}
  </ol>
);
