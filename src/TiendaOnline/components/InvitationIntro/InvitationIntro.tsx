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

const LetterFlourish = ({ className }: { className: string }): JSX.Element => (
  <svg
    className={className}
    viewBox="0 0 160 40"
    fill="none"
    aria-hidden="true"
  >
    <path d="M12 27c22 4 41 0 57-14m-42 15c-7-3-10-8-9-13 7 2 10 7 9 13Zm14-2c-6-5-7-11-5-15 6 4 8 9 5 15Zm13-5c-3-6-2-12 2-15 4 6 3 11-2 15Zm94 7c-22 4-41 0-57-14m42 15c7-3 10-8 9-13-7 2-10 7-9 13Zm-14-2c6-5 7-11 5-15-6 4-8 9-5 15Zm-13-5c3-6 2-12-2-15-4 6-3 11 2 15Z" />
    <path d="m80 12 4 8-4 8-4-8zM80 4v3m0 26v3" />
  </svg>
);

export const InvitationIntro = ({
  novia,
  novio,
  fecha,
  photo,
  children,
}: {
  novia: string;
  novio: string;
  fecha: string;
  photo: string;
  children: ReactNode;
}): JSX.Element => {
  const [state, setState] = useState<InvitationState>('closed');
  const content = useRef<HTMLDivElement>(null);
  const shouldFocus = useRef(false);
  const locked = state !== 'opened';

  const finish = useCallback((): void => {
    setState('opened');
  }, []);

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
    const contentElement = content.current;
    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    contentElement?.setAttribute('inert', '');
    return (): void => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      contentElement?.removeAttribute('inert');
    };
  }, [locked]);

  useEffect(() => {
    if (state === 'opened' && shouldFocus.current) {
      const title = content.current?.querySelector('h1');
      title?.focus({ preventScroll: true });
    }
    if (state !== 'opening') return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = (): void => {
      if (motion.matches) finish();
    };
    motion.addEventListener('change', onMotionChange);
    onMotionChange();
    return (): void => motion.removeEventListener('change', onMotionChange);
  }, [state, finish]);

  const open = (): void => {
    if (state !== 'closed') return;
    shouldFocus.current = true;
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
          <div className="invitation-intro-backdrop" />
          <div className="invitation-intro-heading">
            <p className="eyebrow">Una historia de amor</p>
            <p className="invitation-intro-names">
              {novia} <em>&</em> {novio}
            </p>
            <LetterFlourish className="invitation-heading-flourish" />
            <span className="invitation-intro-date">{fecha}</span>
          </div>
          <button
            type="button"
            className="invitation-envelope-button"
            aria-label={`Abrir la invitación de ${novia} y ${novio}`}
            aria-disabled={state === 'opening'}
            onClick={open}
          >
            <span className="invitation-envelope" aria-hidden="true">
              <span className="envelope-underlay" />
              <span className="envelope-back" />
              <span className="envelope-card">
                <span className="envelope-card-copy">
                  <span className="eyebrow">Nos casamos</span>
                  <span className="envelope-card-names">
                    {novia}
                    <em>&</em>
                    {novio}
                  </span>
                  <LetterFlourish className="envelope-card-rule" />
                  <span className="envelope-card-date">{fecha}</span>
                </span>
                <span
                  className="envelope-card-photo"
                  style={{ backgroundImage: `url("${photo}")` }}
                />
              </span>
              <span className="envelope-pocket" />
              <span className="envelope-address">
                <span>Una carta para ti</span>
                <span>
                  {novia} <i>&</i> {novio}
                </span>
              </span>
              <span className="envelope-flap" />
              <span className="envelope-ribbon" />
              <span className="envelope-seal">
                <span>
                  {novia[0]}
                  <i>&</i>
                  {novio[0]}
                </span>
              </span>
            </span>
            <span className="invitation-open-cue">
              Toca para abrir <span aria-hidden="true">↓</span>
            </span>
          </button>
          <p className="invitation-intro-footer">Con todo nuestro amor</p>
        </div>
      )}
    </div>
  );
};
