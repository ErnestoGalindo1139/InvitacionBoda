import type { JSX } from 'react';
import { imageProps } from '../helpers/images';

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
        {...imageProps(src)}
        sizes="(min-width: 768px) 420px, 100vw"
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
