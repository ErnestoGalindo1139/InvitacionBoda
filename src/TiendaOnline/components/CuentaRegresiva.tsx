import type { JSX } from 'react';
import { useCuentaRegresiva } from '../hooks/useCuentaRegresiva';
export const CuentaRegresiva = ({ fecha }: { fecha: string }): JSX.Element => {
  const tiempo = useCuentaRegresiva(fecha);
  return (
    <div className="countdown-wrap">
      <div
        className="countdown"
        role="timer"
        aria-label="Tiempo restante para la boda"
      >
        {['Días', 'Horas', 'Minutos', 'Segundos'].map((label, i) => (
          <div key={label}>
            <span>{tiempo ? String(tiempo[i]).padStart(2, '0') : '—'}</span>
            <small>{label}</small>
          </div>
        ))}
      </div>
      {!tiempo && (
        <p className="small-note">Pronto comienza la cuenta regresiva.</p>
      )}
      {tiempo?.every((value) => value === 0) && <p>¡Llegó el gran día!</p>}
    </div>
  );
};
