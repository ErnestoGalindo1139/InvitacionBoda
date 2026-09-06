import React, { useEffect, useState } from 'react';
import { VerArchivo } from '../components/VerArchivo';
import { ClipboardList, Building, Ticket } from 'lucide-react';
import { LogoCarousel } from '../components/LogoCarousel';
import { Banner } from '../components/Banner';
import { EventoEnero } from '../components/EventoEnero';
import { useLocation } from 'react-router-dom';

export const SimposioPage = (): React.JSX.Element => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');

    if (section) {
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 350);
    }
  }, [location]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<any>(null);

  // Card especial Brochure
  const brochure = {
    nombre: 'Brochure Oficial del Simposio',
    tipo: 'pdf',
    url: {
      mobile: '/BROCHURE_SIMPOSIO.pdf',
      desktop: '/BROCHURE_SIMPOSIO.pdf',
    },
    preview: {
      mobile: '/img/brochure.png',
      desktop: '/img/brochure.png',
    },
    descripcion:
      'Obtén más detalles del simposio y accede a toda la información del evento.',
    boton: 'Ver documento',
  };

  // Resto de cards
  const archivos = [
    {
      nombre: 'Proceso de Registro',
      tipo: 'image',
      url: {
        mobile: '/img/proceso_registro_mobile.jpg',
        desktop: '/img/proceso_registro_mobile.jpg',
      },
      preview: {
        mobile: '/img/proceso_registro_mobile.jpg',
        desktop: '/img/proceso_registro_mobile.jpg',
      },
      descripcion: 'Es muy simple registrarte, da click y sigue los pasos.',
      icon: ClipboardList,
      boton: 'Ver proceso',
      whatsapp: false,
    },

    {
      nombre: 'Inversión y Beneficios de Acceso',
      tipo: 'image',
      url: {
        mobile: '/img/precio_pase_web_mobile.jpg',
        desktop: '/img/precio_pase_web_desktop.jpg',
      },
      preview: {
        mobile: '/img/precio_pase_web_mobile.jpg',
        desktop: '/img/precio_pase_web_desktop.jpg',
      },
      descripcion:
        'Consulta aquí los costos y beneficios del Pase Oficial al Simposio.',
      icon: Ticket,
      boton: 'Consultar Precio',
      whatsapp: false,
    },

    {
      nombre: 'Soy una organización',
      tipo: 'pdf',
      url: {
        mobile: '/PRECIO_ORGANIZACIONES_MOBILE.pdf',
        desktop: '/PRECIO_ORGANIZACIONES_DESKTOP.pdf',
      },
      preview: {
        mobile: '/img/PaqueteEmpresas_Mobile.jpg',
        desktop: '/img/PaqueteEmpresas_Desktop.jpg',
      },
      descripcion:
        'Contamos con precios preferenciales para tus miembros. Consulta con un asesor.',
      icon: Building,
      boton: 'Solicitar información',
      whatsapp: true,
    },
  ];

  const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
      const onResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, []);

    return isMobile;
  };

  const isMobile = useIsMobile();

  return (
    <div className="w-full min-h-screen mt-[3rem] bg-[#07152E] text-white">
      <LogoCarousel
        title="logos.tituloPatrocinadores"
        logos={[
          'img/patrocinadores/ANMX.png',
          'img/patrocinadores/DIAZ SALAZAR Y ASOCIADOS.png',
          'img/patrocinadores/LF DESPACHO.png',
          'img/patrocinadores/P&C.png',
          'img/patrocinadores/RCCO NEGOCIOS.png',
          'img/patrocinadores/SOMOFA.png',
          'img/patrocinadores/grupoAHRE.png',
          'img/patrocinadores/ANMX.png',
          'img/patrocinadores/DIAZ SALAZAR Y ASOCIADOS.png',
          'img/patrocinadores/LF DESPACHO.png',
          'img/patrocinadores/P&C.png',
          'img/patrocinadores/RCCO NEGOCIOS.png',
          'img/patrocinadores/SOMOFA.png',
          'img/patrocinadores/grupoAHRE.png',
        ]}
      />

      <Banner quitarboton />

      {/* CARD ESPECIAL — BROCHURE */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div
          onClick={() =>
            setArchivoSeleccionado({
              ...brochure,
              url: isMobile ? brochure.url.mobile : brochure.url.desktop,
            })
          }
          className="
            bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] shadow-lg
            transition-all cursor-pointer flex flex-col
            hover:-translate-y-1 hover:shadow-blue-300/40
            hover:border-[#0a387c] overflow-hidden
          "
        >
          <img
            src={isMobile ? brochure.preview.mobile : brochure.preview.desktop}
            alt="Preview Brochure"
            className="w-full h-[full] md:h-[550px] object-center"
          />

          <div className="px-7 py-6">
            <h2 className="text-xl font-extrabold text-[#04163B]">
              {brochure.nombre}
            </h2>
            <p className="text-sm text-[#475569] mt-2">
              {brochure.descripcion}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setArchivoSeleccionado({
                  ...brochure,
                  url: isMobile ? brochure.url.mobile : brochure.url.desktop,
                });
              }}
              className="
                mt-6 w-full py-3 rounded-xl
                bg-[#0a387c] hover:bg-[#114b9c]
                text-white text-base font-extrabold tracking-wide
                shadow-lg hover:shadow-blue-600/40
                transition-all active:scale-95
              "
            >
              {brochure.boton}
            </button>
          </div>
        </div>
      </div>

      {/* GRID — OTRAS 2 CARDS */}
      <div className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch">
        {archivos.map((a, i) => {
          const abrirWhatsApp = () => {
            const mensaje = encodeURIComponent(
              'Hola, estoy interesado en obtener información para registrar a mi organización en el 1er Simposio Anual Corporativo sobre Prevención de Lavado de Dinero.'
            );
            window.open(`https://wa.me/6692291634?text=${mensaje}`, '_blank');
          };

          return (
            <div
              key={i}
              onClick={() => {
                if (a.whatsapp) {
                  abrirWhatsApp();
                  return;
                }
                setArchivoSeleccionado({
                  ...a,
                  url: isMobile ? a.url.mobile : a.url.desktop,
                });
              }}
              className="
          bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]
          shadow-lg transition-all cursor-pointer
          hover:-translate-y-1 hover:shadow-blue-300/40
          hover:border-[#0a387c]
          flex flex-col h-full overflow-hidden
        "
            >
              {/* IMAGEN – ALTURA FIJA */}
              {a.nombre === 'Proceso de Registro' && !isMobile ? (
                /* 🔵 SOLO DESKTOP — SOLO PROCESO DE REGISTRO */
                <div className="relative w-full md:h-[220px] overflow-hidden">
                  {/* Fondo desenfocado */}
                  <img
                    src={a.preview.desktop}
                    alt=""
                    className="
                      absolute inset-0
                      w-full h-full
                      object-cover
                      scale-110
                      blur-xl
                      opacity-70
                    "
                  />

                  {/* Imagen principal nítida */}
                  <img
                    src={a.preview.desktop}
                    alt={a.nombre}
                    className="
                      relative z-10
                      w-full h-full
                      object-contain
                    "
                  />
                </div>
              ) : (
                /* 🔹 TODAS LAS DEMÁS IMÁGENES */
                <img
                  src={isMobile ? a.preview.mobile : a.preview.desktop}
                  alt={a.nombre}
                  className="w-full h-full md:h-[220px] object-center"
                />
              )}

              {/* CONTENIDO */}
              <div className="px-7 py-6 flex flex-col flex-1">
                <h3 className="text-xl font-extrabold text-[#04163B]">
                  {a.nombre}
                </h3>

                {/* DESCRIPCIÓN – MISMO COMPORTAMIENTO */}
                <p className="text-sm text-[#475569] mt-2 mb-6">
                  {a.descripcion}
                </p>

                {/* BOTÓN SIEMPRE ABAJO */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (a.whatsapp) {
                      abrirWhatsApp();
                      return;
                    }
                    setArchivoSeleccionado({
                      ...a,
                      url: isMobile ? a.url.mobile : a.url.desktop,
                    });
                  }}
                  className="
              mt-auto w-full py-3 rounded-xl
              bg-[#0a387c] hover:bg-[#114b9c]
              text-white text-base font-extrabold tracking-wide
              shadow-lg hover:shadow-blue-600/40
              transition-all active:scale-95
            "
                >
                  {a.boton}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <EventoEnero />

      {/* MODAL */}
      {archivoSeleccionado && (
        <VerArchivo
          modo="modal"
          url={archivoSeleccionado.url}
          // nombre={archivoSeleccionado.nombre}
          tipo={archivoSeleccionado.tipo}
          isOpen={true}
          onClose={() => setArchivoSeleccionado(null)}
        />
      )}
    </div>
  );
};
