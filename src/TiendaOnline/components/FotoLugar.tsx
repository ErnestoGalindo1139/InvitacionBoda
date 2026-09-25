import type { JSX } from 'react';
import { assetUrl } from '../helpers/invitacion';

export const FotoLugar = ({
  src,
  alt,
  nombre,
}: {
  src: string;
  alt: string;
  nombre: string;
}): JSX.Element => (
  <figure className="venue-photo">
    <span className="venue-photo-tape" aria-hidden="true" />
    <div className="venue-photo-image">
      <img
        src={assetUrl(src)}
        alt={alt}
        loading="lazy"
        decoding="async"
        width="1200"
        height="724"
      />
    </div>
    <figcaption>
      <span className="venue-photo-flourish" aria-hidden="true">
        ✧
      </span>
      {nombre}
    </figcaption>
  </figure>
);
