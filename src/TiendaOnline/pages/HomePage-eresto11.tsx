import { Banner } from '../components/Banner';
import { LogoCarousel } from '../components/LogoCarousel';
import { Nosotros } from '../components/Nosotros';
import { NuestroEquipo } from '../components/NuestroEquipo';
import { Servicios } from '../components/Servicios';
import { Valores } from '../components/Valores';
import { UbicacionComponent } from '../components/Ubicacion';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AreasEspecializadas } from '../components/AreasEspecializadas';
import { ConstruccionJuridica } from '../components/ConstruccionJuridica';
import { EventoPopup } from '../components/EventoPopUp';
import { EventoEnero } from '../components/EventoEnero';

export const HomePage = (): React.JSX.Element => {
  const location = useLocation();

  useEffect(() => {
    // Tomar la sección desde la URL: /#/?section=evento-enero
    const params = new URLSearchParams(location.search);
    const section = params.get('section');

    if (section) {
      // Esperar un momento a que cargue el DOM
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 350);
    }
  }, [location]);

  return (
    <div className="w-full min-w-full overflow-x-hidden">
      {/* Popup del evento */}
      <EventoPopup />
      <Banner />

      <Nosotros />
      <ConstruccionJuridica />
      <Valores />
      <Servicios />
      <AreasEspecializadas />
      <NuestroEquipo />

      <LogoCarousel
        height={160}
        gap={1}
        speed={2}
        direction="left"
        title="logos.trustHeadline"
      />

      <UbicacionComponent
        title="ubicacion.title"
        address="Sierra India 217, Lomas de Mazatlán, 82110 Mazatlán, Sin."
        lat={23.2473373}
        lng={-106.4473197}
        zoom={16}
        phone="+52 669 229 1634"
        hours="ubicacion.schedule.week"
        className="bg-background w-full"
      />
    </div>
  );
};
