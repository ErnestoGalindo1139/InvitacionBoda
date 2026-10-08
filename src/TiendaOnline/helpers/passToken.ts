export function passToken(value: string): string {
  let token = value.trim();
  if (/^https?:\/\//i.test(token)) {
    try {
      token = new URL(token).searchParams.get('qr') || '';
    } catch {
      token = '';
    }
  }
  if (!/^[A-Fa-f0-9]{64}$/.test(token))
    throw new Error('Introduce el token QR o la URL completa del pase.');
  return token.toUpperCase();
}
