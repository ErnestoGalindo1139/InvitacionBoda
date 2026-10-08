export type Invitation = {
  nb_Persona: string;
  nb_Boda: string;
  fh_Boda: string;
  fh_LimiteConfirmacion?: string | null;
  nu_PasesAsignados: number;
  nu_PasesConfirmados: number | null;
  sn_Confirmada: boolean;
  fh_Confirmacion: string | null;
  pase: { nb_TokenQR: string; fh_Registro: string } | null;
};
export type Family = Invitation & {
  id_Familia: number;
  nb_Telefono: string | null;
  enlace: string;
};
export type FamilySummary = Pick<
  Family,
  | 'id_Familia'
  | 'nb_Persona'
  | 'nb_Telefono'
  | 'sn_Confirmada'
  | 'nu_PasesAsignados'
  | 'nu_PasesConfirmados'
>;
export type Pass = Pick<
  Invitation,
  'nb_Persona' | 'nb_Boda' | 'fh_Boda' | 'nu_PasesAsignados'
> & { nu_PasesConfirmados: number; nb_TokenQR: string };
export type FamilyDraft = {
  nb_Persona: string;
  nb_Telefono: string;
  nu_PasesAsignados: number;
};
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
const apiUrl = (
  import.meta.env.VITE_API_URL || 'http://localhost:4001/api'
).replace(/\/$/, '');
export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError')
      throw error;
    throw new ApiError(
      0,
      'No se pudo conectar. Revisa tu conexión e intenta de nuevo.'
    );
  }
  const data =
    response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      response.status,
      data?.message || 'No fue posible completar la operación.'
    );
  if (response.status !== 204 && data === null)
    throw new ApiError(
      502,
      'La API devolvió una respuesta inválida. Revisa su configuración o intenta nuevamente.'
    );
  return data as T;
}
export const errorMessage = (error: unknown): string =>
  error instanceof Error
    ? error.message
    : 'Ocurrió un error. Intenta nuevamente.';
