import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type JSX,
  type ReactNode,
} from 'react';
import './InvitationIntro.css';

type InvitationState = 'closed' | 'opening' | 'opened';

export const InvitationIntro = ({
  novia,
  novio,
  fecha,
  photo,
  onOpen,
  children,
}: {
  novia: string;
  novio: string;
  fecha: string;
  photo: string;
  onOpen: () => void;
  children: ReactNode;
}): JSX.Element => {
  const [state, setState] = useState<InvitationState>('closed');
  const content = useRef<HTMLDivElement>(null);
  const shouldFocus = useRef(false);
  const locked = state !== 'opened';
  const finish = useCallback((): void => setState('opened'), []);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent): void => {
      if (!event.persisted) return;
      shouldFocus.current = false;
      setState('closed');
    };
    window.addEventListener('pageshow', onPageShow);
    return (): void => window.removeEventListener('pageshow', onPageShow);
  }, []);

  useEffect(() => {
    if (!locked) return;
    const element = content.current;
    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    element?.setAttribute('inert', '');
    return (): void => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      element?.removeAttribute('inert');
    };
  }, [locked]);

  useEffect(() => {
    if (state === 'opened' && shouldFocus.current) {
      content.current?.querySelector('h1')?.focus({ preventScroll: true });
    }
    if (state !== 'opening') return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = (): void => {
      if (motion.matches) finish();
    };
    motion.addEventListener('change', onMotionChange);
    onMotionChange();
    // Release the page even if the browser interrupts the animation.
    const fallback = window.setTimeout(finish, 2600);
    return (): void => {
      motion.removeEventListener('change', onMotionChange);
      window.clearTimeout(fallback);
    };
  }, [state, finish]);

  const open = (): void => {
    if (state !== 'closed') return;
    shouldFocus.current = true;
    onOpen();
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
    else setState('opening');
  };

  return (
    <div className="wedding invitation-experience" data-invitation={state}>
      <div
        ref={content}
        className="invitation-content"
        aria-hidden={locked ? true : undefined}
      >
        {children}
      </div>
      {locked && (
        <div
          className="invitation-intro"
          onAnimationEnd={(event) => {
            if (
              event.target === event.currentTarget &&
              event.animationName === 'invitation-unveil'
            )
              finish();
          }}
        >
          <div
            className="cinema-backdrop"
            style={{ backgroundImage: 'url("' + photo + '")' }}
            aria-hidden="true"
          />
          <div className="cinema-viewfinder" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="cinema-topline" aria-hidden="true">
            <span>
              {novia[0]} &amp; {novio[0]} <i>FILMS</i>
            </span>
            <span className="cinema-rec">
              <b /> {state === 'opening' ? 'REC' : 'STANDBY'}
            </span>
          </div>
          <div className="cinema-stage">
            <div className="cinema-heading">
              <p className="eyebrow">UNA PELÍCULA DE AMOR</p>
              <h2>
                Estamos a punto
                <br />
                de decir <em>«acción».</em>
              </h2>
            </div>
            <button
              type="button"
              className="clapper-button"
              aria-label={'Iniciar la película de ' + novia + ' y ' + novio}
              aria-disabled={state === 'opening'}
              onClick={open}
            >
              <span className="clapper" aria-hidden="true">
                <span className="clapper-arm" />
                <span className="clapper-fixed-bar" />
                <span className="clapper-hinge">
                  <i />
                  <i />
                </span>
                <span className="clapper-board">
                  <span className="slate-production">
                    <small>PRODUCCIÓN</small>
                    <span>Una vida contigo</span>
                    <b>01</b>
                  </span>
                  <span className="slate-names">
                    <small>PROTAGONISTAS</small>
                    <span>
                      {novia}
                      <em>&amp;</em>
                      {novio}
                    </span>
                  </span>
                  <span className="slate-grid">
                    <span>
                      <small>ESCENA</small>
                      <strong>La boda</strong>
                    </span>
                    <span>
                      <small>TOMA</small>
                      <strong>Única</strong>
                    </span>
                    <span>
                      <small>DURACIÓN</small>
                      <strong>Siempre</strong>
                    </span>
                  </span>
                  <span className="slate-date">
                    <small>ESTRENO</small>
                    <span>{fecha}</span>
                  </span>
                  <span className="slate-bottom">
                    <span>
                      SONIDO <b>♥</b> ESTÉREO
                    </span>
                    <span>HECHA CON AMOR</span>
                  </span>
                </span>
              </span>
              <span className="clapper-cue">
                <span className="clapper-play" aria-hidden="true">
                  ▶
                </span>
                <span>
                  Toca la claqueta<span>Y QUE COMIENCE NUESTRA HISTORIA</span>
                </span>
              </span>
            </button>
            <p className="cinema-action" role="status">
              {state === 'opening' ? 'Silencio en el set… ¡Acción!' : ''}
            </p>
          </div>
          <div className="cinema-bottomline">
            <span>UNA HISTORIA REAL. UN AMOR DE PELÍCULA.</span>
            <span>{fecha}</span>
          </div>
        </div>
      )}
    </div>
  );
};
