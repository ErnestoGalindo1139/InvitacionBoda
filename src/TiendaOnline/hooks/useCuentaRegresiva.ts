import { useEffect, useState } from 'react';
import { tiempoRestante } from '../helpers/invitacion';
export const useCuentaRegresiva = (fecha: string): number[] | null => {
  const [tiempo, setTiempo] = useState(() => tiempoRestante(fecha));
  useEffect(() => {
    setTiempo(tiempoRestante(fecha));
    if (!Number.isFinite(Date.parse(fecha))) return;
    const timer = window.setInterval(
      () => setTiempo(tiempoRestante(fecha)),
      1000
    );
    return (): void => window.clearInterval(timer);
  }, [fecha]);
  return tiempo;
};
