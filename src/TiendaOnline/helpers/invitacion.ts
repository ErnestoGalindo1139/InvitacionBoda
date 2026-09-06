export const assetUrl = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
export const whatsappUrl = (
  numero: string,
  mensaje: string
): string | undefined =>
  /^\d{10,15}$/.test(numero)
    ? `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
    : undefined;
export const mapsUrl = (url: string): string | undefined => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' ? parsed.href : undefined;
  } catch {
    return undefined;
  }
};
export const tiempoRestante = (
  fecha: string,
  ahora = Date.now()
): number[] | null => {
  const objetivo = Date.parse(fecha);
  if (!Number.isFinite(objetivo)) return null;
  const s = Math.max(0, Math.floor((objetivo - ahora) / 1000));
  return [
    Math.floor(s / 86400),
    Math.floor(s / 3600) % 24,
    Math.floor(s / 60) % 60,
    s % 60,
  ];
};
