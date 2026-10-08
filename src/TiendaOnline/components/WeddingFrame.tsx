import { Link } from 'react-router-dom';
import type { ReactNode, JSX } from 'react';
import { invitacion } from '../data/invitacion';
export function WeddingFrame({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="wedding wedding-system">
      <header className="system-header">
        <Link to="/" className="signature">
          {invitacion.novia} & {invitacion.novio}
        </Link>
        <span>{invitacion.fechaTexto}</span>
      </header>
      <main className="system-main">{children}</main>
      <footer className="system-footer">
        Una película de amor · <Link to="/">Ver invitación</Link>
      </footer>
    </div>
  );
}
