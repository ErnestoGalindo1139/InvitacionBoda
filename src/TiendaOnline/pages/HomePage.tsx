import { useEffect, useState, type FormEvent, type JSX } from 'react';
import {
  CheckCircle2,
  CalendarDays,
  ExternalLink,
  Gift,
  Heart,
  Mail,
  MessageSquareText,
  Phone,
  Send,
  UserRound,
  XCircle,
} from 'lucide-react';
import { invitacion as data } from '../data/invitacion';
import { assetUrl, mapsUrl, whatsappUrl } from '../helpers/invitacion';
import { Reveal } from '../components/Reveal';
import { CuentaRegresiva } from '../components/CuentaRegresiva';
import { Galeria } from '../components/Galeria';
import { Musica } from '../components/Musica';
import { InvitationIntro } from '../components/InvitationIntro/InvitationIntro';
import { Itinerario } from '../components/Itinerario';
import { FotoLugar } from '../components/FotoLugar';
const goTo = (id: string): void =>
  document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'instant'
      : 'smooth',
  });
export const HomePage = (): JSX.Element => {
  const rsvp = whatsappUrl(data.whatsapp, data.mensajeConfirmacion);
  const [showFloatingRsvp, setShowFloatingRsvp] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('.wedding .hero');
    if (!hero || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      setShowFloatingRsvp(
        !entry.isIntersecting && entry.boundingClientRect.bottom <= 0
      );
    });
    observer.observe(hero);
    return (): void => observer.disconnect();
  }, []);

  const handleRsvpSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nombre = String(formData.get('nombre') ?? '').trim();
    const celular = String(formData.get('celular') ?? '').trim();
    const asistencia = String(formData.get('asistencia') ?? '').trim();
    const mensajeInvitado = String(formData.get('mensaje') ?? '').trim();
    const mensaje = [
      data.mensajeConfirmacion,
      `Nombre: ${nombre}`,
      `Celular: ${celular}`,
      `Respuesta: ${asistencia}`,
      mensajeInvitado ? `Mensaje: ${mensajeInvitado}` : '',
    ]
      .filter(Boolean)
      .join('\n');
    const confirmacion = whatsappUrl(data.whatsapp, mensaje);

    if (confirmacion) {
      window.open(confirmacion, '_blank', 'noopener,noreferrer');
    }

    setConfirmationSent(true);
    form.reset();
  };

  return (
    <InvitationIntro
      novia={data.novia}
      novio={data.novio}
      fecha={data.fechaTexto}
      photo={assetUrl(data.fotos[0].src)}
    >
      <main>
        <header className="hero">
          <img
            className="hero-photo"
            src={assetUrl(data.fotos[0].src)}
            alt={data.fotos[0].alt}
            width="1800"
            height="1200"
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <nav className="topbar" aria-label="Invitación">
            <span>UNA HISTORIA DE AMOR</span>
          </nav>
          <div className="hero-content">
            <p className="eyebrow">Nos casamos</p>
            <h1 tabIndex={-1}>
              <span>{data.novia}</span>
              <em>&</em>
              <span>{data.novio}</span>
            </h1>
            <div className="hero-rule" />
            <p className="hero-date">{data.fechaTexto}</p>
            <p className="hero-caption">Y queremos vivir este día contigo.</p>
          </div>
          <button className="scroll-cue" onClick={() => goTo('historia')}>
            DESCUBRE NUESTRA INVITACIÓN <span>↓</span>
          </button>
        </header>
        <section className="welcome section-pad" id="historia">
          <Reveal className="welcome-copy">
            <p className="eyebrow">Con todo nuestro amor</p>
            <h2>
              Lo más bonito de la vida
              <br />
              <em>es compartirla.</em>
            </h2>
            <p>{data.bienvenida}</p>
            <span className="signature">Con amor, nosotros.</span>
          </Reveal>
          <Reveal className="welcome-photo">
            <img
              src={assetUrl(data.fotos[1].src)}
              alt={data.fotos[1].alt}
              loading="lazy"
              width="1400"
              height="933"
            />
            <span>EL INICIO DE NUESTRO SIEMPRE</span>
          </Reveal>
        </section>
        <section className="blessing section-pad">
          <Reveal className="blessing-paper-stack">
            <div className="blessing-ribbon" aria-hidden="true" />
            <div className="blessing-seal" aria-hidden="true">
              <span>
                {data.novia[0]}
                <i>&</i>
                {data.novio[0]}
              </span>
            </div>
            <div className="blessing-card">
              <div className="blessing-copy">
                <p className="blessing-kicker">
                  Con la bendición de Dios
                  <span>y en compañía de</span>
                </p>
                <h2>Nuestros Padres:</h2>
                <div className="blessing-parents">
                  {data.bendicion.padres.map((grupo) => (
                    <div className="blessing-group" key={grupo.titulo}>
                      <span>{grupo.titulo}</span>
                      {grupo.nombres.map((nombre) => (
                        <p key={nombre}>{nombre}</p>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="blessing-sponsors">
                  <div className="blessing-ornament" aria-hidden="true">
                    <svg viewBox="0 0 160 32" fill="none">
                      <path d="M0 16h48c14 0 22-10 32-10s18 10 32 10h48M48 16c14 0 22 10 32 10s18-10 32-10" />
                      <path d="m80 11 5 5-5 5-5-5z" />
                    </svg>
                  </div>
                  <h2>Nuestros Padrinos:</h2>
                  {data.bendicion.padrinos.nombres.map((nombre) => (
                    <p key={nombre}>{nombre}</p>
                  ))}
                </div>
                <span className="blessing-signoff" aria-hidden="true">
                  {data.novia[0]} & {data.novio[0]}
                </span>
              </div>
            </div>
          </Reveal>
        </section>
        <section className="countdown-section section-pad">
          <Reveal>
            <p className="eyebrow">Cada vez más cerca</p>
            <h2>
              Un día para recordar.
              <br />
              <em>Una vida para compartir.</em>
            </h2>
            <CuentaRegresiva fecha={data.fechaISO} />
          </Reveal>
        </section>
        <section className="events section-pad" id="evento">
          <Reveal>
            <p className="eyebrow">La cita más especial</p>
            <h2>
              Donde comienza
              <br />
              <em>nuestro para siempre.</em>
            </h2>
            <p className="event-date">{data.fechaTexto}</p>
          </Reveal>
          <div className="event-grid">
            {[
              { ...data.ceremonia, titulo: 'La ceremonia', numero: '01' },
              { ...data.recepcion, titulo: 'La celebración', numero: '02' },
            ].map((evento) => (
              <Reveal key={evento.numero} className="event-card">
                <span className="event-number">{evento.numero}</span>
                <h3>{evento.titulo}</h3>
                <p className="event-time">{evento.hora}</p>
                {evento.foto.src ? (
                  <FotoLugar
                    src={evento.foto.src}
                    alt={evento.foto.alt}
                    nombre={evento.nombre}
                  />
                ) : (
                  <p>{evento.nombre}</p>
                )}
                {evento.direccion && <p>{evento.direccion}</p>}
                {mapsUrl(evento.maps) ? (
                  <a
                    className="text-link"
                    href={mapsUrl(evento.maps)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver ubicación ↗
                  </a>
                ) : (
                  <span className="small-note">Ubicación por confirmar</span>
                )}
              </Reveal>
            ))}
          </div>
        </section>
        <section className="gallery-section section-pad">
          <Reveal>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Nuestra historia, en instantes</p>
                <h2>
                  Así se ve <em>el amor.</em>
                </h2>
              </div>
              <span className="tiny-flourish" aria-hidden="true">
                &
              </span>
            </div>
            <Galeria fotos={data.fotosCarrusel} />
          </Reveal>
        </section>
        <section className="itinerary section-pad">
          <Reveal className="itinerary-intro">
            <p className="eyebrow">El ritmo de nuestro día</p>
            <h2>
              De un «sí, acepto»
              <br />
              <em>a un último baile.</em>
            </h2>
            <p>Cada momento será más bonito contigo.</p>
          </Reveal>
          <Itinerario momentos={data.itinerario} />
        </section>
        <section className="dress section-pad">
          <Reveal>
            <p className="eyebrow">Un toque de elegancia</p>
            <h2>{data.dressCode}</h2>
            <p>
              Elige ese look con el que te sientas increíble.
              <br />
              Estos tonos pueden inspirarte.
            </p>
            <div className="swatches">
              {data.colores.map((color) => (
                <div key={color.nombre}>
                  <span style={{ backgroundColor: color.valor }} />
                  <small>{color.nombre}</small>
                </div>
              ))}
            </div>
          </Reveal>
        </section>
        <section className="rsvp section-pad" id="confirmacion">
          <Reveal>
            <p className="eyebrow">Nos falta lo más importante: tú</p>
            <h2>CONFIRMAR ASISTENCIA</h2>
            <p>
              Nos encantará celebrar contigo.
              <br />
              Tu asistencia es importante para nosotros, ya que compartir este
              dia contigo lo hace aun mas especial. Por favor, confirma tu a
              asistencia en el formulario de abajo.
            </p>
            {rsvp ? (
              <a
                className="button-primary"
                href={rsvp}
                target="_blank"
                rel="noopener noreferrer"
              >
                Confirmar por WhatsApp ↗
              </a>
            ) : (
              <>
                <button className="button-primary" disabled>
                  Confirmar por WhatsApp ↗
                </button>
                <div className="adult-only-note" role="note">
                  <div>
                    <h3>
                      <strong>SIN NIÑOS</strong>
                    </h3>
                    <p>
                      Aunque amamos a los niños, nuestra celebración está
                      pensada como una velada solo para adultos. Agradecemos su
                      comprensión y esperamos compartir con ustedes una noche
                      inolvidable.
                    </p>
                  </div>
                </div>
                <form className="rsvp-form" onSubmit={handleRsvpSubmit}>
                  <div className="rsvp-field">
                    <label htmlFor="rsvp-nombre">Nombre</label>
                    <div className="rsvp-input-wrap">
                      <UserRound size={18} aria-hidden="true" />
                      <input
                        id="rsvp-nombre"
                        name="nombre"
                        type="text"
                        placeholder="Tu nombre"
                        autoComplete="name"
                        required
                      />
                    </div>
                  </div>
                  <div className="rsvp-field">
                    <label htmlFor="rsvp-celular">Celular</label>
                    <div className="rsvp-input-wrap">
                      <Phone size={18} aria-hidden="true" />
                      <input
                        id="rsvp-celular"
                        name="celular"
                        type="tel"
                        placeholder="Tu celular"
                        autoComplete="tel"
                        required
                      />
                    </div>
                  </div>
                  <fieldset className="rsvp-field rsvp-radio-group">
                    <legend>¿Nos acompañarás?</legend>
                    <div className="rsvp-radio-options">
                      <label className="rsvp-radio-option">
                        <input
                          type="radio"
                          name="asistencia"
                          value="Sí asistiré"
                          required
                        />
                        <span>
                          <CheckCircle2 size={18} aria-hidden="true" />
                          Sí asistiré
                        </span>
                      </label>
                      <label className="rsvp-radio-option">
                        <input
                          type="radio"
                          name="asistencia"
                          value="No podré asistir"
                          required
                        />
                        <span>
                          <XCircle size={18} aria-hidden="true" />
                          No podré asistir
                        </span>
                      </label>
                    </div>
                  </fieldset>
                  <div className="rsvp-field mt-[1rem]">
                    <label htmlFor="rsvp-mensaje">
                      Confirma el numero de personas que asistiran.
                      <span className="rsvp-label-highlight">
                        (No exceder el numero asignado en tu pase)
                      </span>
                    </label>
                    <div className="rsvp-textarea-wrap">
                      <MessageSquareText size={18} aria-hidden="true" />
                      <textarea
                        id="rsvp-mensaje"
                        name="mensaje"
                        placeholder="Escribe algún detalle o comentario"
                        rows={4}
                      />
                    </div>
                  </div>
                  <button className="rsvp-submit" type="submit">
                    <Send size={18} aria-hidden="true" />
                    Confirmar asistencia
                  </button>
                  {confirmationSent && (
                    <p className="rsvp-form-status" role="status">
                      Gracias, tu confirmación quedó preparada.
                    </p>
                  )}
                </form>
              </>
            )}
          </Reveal>
        </section>
        {data.regalos.mostrar && (
          <section className="gifts section-pad">
            <Reveal>
              <span className="eyebrow">Un detalle con cariño</span>
              <h2>{data.regalos.titulo}</h2>
              <p>{data.regalos.texto}</p>
              <div className="gift-options">
                <div className="gift-option gift-option-envelope">
                  <span className="gift-option-number">01</span>
                  <div className="gift-option-art" aria-hidden="true">
                    <Mail size={42} strokeWidth={1.2} />
                    <Heart className="gift-art-heart" size={15} fill="currentColor" />
                  </div>
                  <h3>Sobre</h3>
                  <p>Podrás entregarlo el día de la boda.</p>
                  <span className="gift-option-detail">LLUVIA DE SOBRES</span>
                </div>
                {data.regalos.mesas.map((mesa, index) => (
                  <div className="gift-option" key={mesa.nombre}>
                    <span className="gift-option-number">0{index + 2}</span>
                    <div className="gift-option-art" aria-hidden="true">
                      {mesa.nombre === 'Liverpool' ? (
                        <img src={assetUrl(data.fotos[0].src)} alt="" loading="lazy" />
                      ) : (
                        <Gift size={44} strokeWidth={1.2} />
                      )}
                    </div>
                    <h3>{mesa.nombre}</h3>
                    <p className="gift-event-title">Boda de {data.novio} y {data.novia}</p>
                    <div className="gift-event-meta">
                      <span><CalendarDays size={15} aria-hidden="true" /> {data.fechaTexto}</span>
                      <span>Evento {mesa.numeroEvento}</span>
                    </div>
                    <a
                      className="gift-option-link"
                      href={mesa.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ver mesa de regalos en ${mesa.nombre} (abre en una pestaña nueva)`}
                    >
                      Ver mesa de regalos <ExternalLink size={15} aria-hidden="true" />
                    </a>
                  </div>
                ))}
              </div>
            </Reveal>
          </section>
        )}
        <footer className="closing">
          <img
            src={assetUrl(data.fotos[2].src)}
            alt={data.fotos[2].alt}
            loading="lazy"
            width="1800"
            height="1013"
          />
          <div className="closing-shade" />
          <Reveal>
            <p className="eyebrow">Nuestro siguiente capítulo</p>
            <h2>{data.fraseFinal}</h2>
            <p className="closing-names">
              {data.novia} <em>&</em> {data.novio}
            </p>
            <p>{data.fechaTexto}</p>
          </Reveal>
        </footer>
        <Musica {...data.musica} />
        {showFloatingRsvp && (
          <button
            className="floating-rsvp"
            onClick={() => goTo('confirmacion')}
          >
            ♡ <span>Confirmar asistencia</span>
          </button>
        )}
      </main>
    </InvitationIntro>
  );
};
