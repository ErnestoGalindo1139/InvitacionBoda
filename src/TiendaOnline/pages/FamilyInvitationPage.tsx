import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type JSX,
} from 'react';
import { useParams } from 'react-router-dom';
import { api, ApiError, errorMessage, type Invitation } from '../helpers/api';
import { WeddingFrame } from '../components/WeddingFrame';
import { FamilyPass } from '../components/FamilyPass';

export function FamilyInvitationPage(): JSX.Element {
  const { token = '' } = useParams();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [quantity, setQuantity] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const load = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      setLoading(true);
      setError('');
      try {
        if (!/^[A-Fa-f0-9]{64}$/.test(token))
          throw new Error(
            'El enlace es inválido. Solicita tu invitación al organizador.'
          );
        const result = await api<Invitation>(`/invitaciones/${token}`, {
          signal,
        });
        if (signal?.aborted) return;
        setInvitation(result);
        setQuantity('');
        setReviewing(false);
        setAccepted(false);
      } catch (reason) {
        if (!signal?.aborted) setError(errorMessage(reason));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [token]
  );
  useEffect(() => {
    setInvitation(null);
    const controller = new AbortController();
    void load(controller.signal);
    return (): void => controller.abort();
  }, [load]);
  function review(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError('');
    if (
      !invitation ||
      quantity === '' ||
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      quantity > invitation.nu_PasesAsignados
    ) {
      setError('Selecciona cuántos de tus pases usarás.');
      return;
    }
    setReviewing(true);
    setAccepted(false);
  }
  async function confirm(): Promise<void> {
    if (!accepted || !invitation || quantity === '' || saving) return;
    setSaving(true);
    setError('');
    try {
      const result = await api<Invitation>(
        `/invitaciones/${token}/confirmacion`,
        {
          method: 'POST',
          body: JSON.stringify({
            confirmacionExplicita: true,
            nu_PasesConfirmados: quantity,
          }),
        }
      );
      setInvitation(result);
      setReviewing(false);
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 409) await load();
      else if (
        reason instanceof ApiError &&
        reason.status >= 400 &&
        reason.status < 500
      )
        setError(errorMessage(reason));
      else
        setError(
          `${errorMessage(reason)} Si hubo una interrupción, recarga para comprobar si se guardó tu confirmación.`
        );
    } finally {
      setSaving(false);
    }
  }
  return (
    <WeddingFrame>
      {loading ? (
        <p role="status">Cargando tu invitación…</p>
      ) : (
        <>
          {error && (
            <p className="system-error" role="alert">
              {error}
            </p>
          )}
          {!invitation ? (
            <section className="system-card">
              <h1>No pudimos abrir tu invitación</h1>
              <p>
                Verifica el enlace recibido o solicita ayuda al organizador.
              </p>
              <button onClick={() => void load()}>Intentar de nuevo</button>
            </section>
          ) : (
            <>
              <p className="eyebrow">Eres parte de nuestra historia</p>
              <h1>Hola, {invitation.nb_Persona}</h1>
              <p>{invitation.nb_Boda}</p>
              <p>
                Tienes{' '}
                <strong>
                  {invitation.nu_PasesAsignados}{' '}
                  {invitation.nu_PasesAsignados === 1
                    ? 'pase asignado'
                    : 'pases asignados'}
                </strong>{' '}
                para la celebración.
              </p>
              {invitation.sn_Confirmada ? (
                <>
                  <section className="system-card">
                    <h2>Confirmación recibida</h2>
                    <p>
                      Confirmaste{' '}
                      <strong>
                        {invitation.nu_PasesConfirmados} de{' '}
                        {invitation.nu_PasesAsignados} pases
                      </strong>
                      .
                    </p>
                    <p>
                      Tu confirmación quedó guardada y no puede modificarse.
                    </p>
                    {invitation.nu_PasesConfirmados === 0 && (
                      <p>
                        Gracias por avisarnos que no asistirás. No se generó un
                        pase.
                      </p>
                    )}
                  </section>
                  {invitation.pase &&
                    invitation.nu_PasesConfirmados !== null && (
                      <FamilyPass
                        pass={{
                          ...invitation,
                          nu_PasesConfirmados: invitation.nu_PasesConfirmados,
                          nb_TokenQR: invitation.pase.nb_TokenQR,
                        }}
                      />
                    )}
                </>
              ) : invitation.fh_LimiteConfirmacion &&
                Date.parse(invitation.fh_LimiteConfirmacion) < Date.now() ? (
                <section className="system-card">
                  <h2>Plazo de confirmación terminado</h2>
                  <p>
                    El plazo para responder esta invitación ya cerró. Contacta
                    al organizador si necesitas ayuda.
                  </p>
                </section>
              ) : reviewing ? (
                <section
                  className="system-card"
                  aria-label="Revisar confirmación"
                >
                  <h2>Revisa tu confirmación</h2>
                  <p>
                    Vas a usar{' '}
                    <strong>
                      {quantity} de {invitation.nu_PasesAsignados} pases
                    </strong>
                    .
                  </p>
                  {quantity === 0 && <p>Esto confirma que no asistirás.</p>}
                  <p>
                    Solo podrás confirmar una vez. Revisa la cantidad antes de
                    enviarla; después no podrás cambiarla.
                  </p>
                  <label className="accept-label">
                    <input
                      type="checkbox"
                      checked={accepted}
                      disabled={saving}
                      onChange={(e) => setAccepted(e.target.checked)}
                    />
                    He revisado la cantidad de pases y acepto que esta
                    confirmación es definitiva.
                  </label>
                  <div className="system-actions">
                    <button
                      disabled={saving}
                      onClick={() => setReviewing(false)}
                    >
                      Volver a corregir
                    </button>
                    <button
                      className="system-primary"
                      disabled={!accepted || saving}
                      onClick={() => void confirm()}
                    >
                      {saving ? 'Guardando…' : 'Enviar confirmación definitiva'}
                    </button>
                  </div>
                </section>
              ) : (
                <form className="system-card" onSubmit={review}>
                  <h2>¿Cuántos pases usarás?</h2>
                  <p>
                    Cuenta a todas las personas que asistirán contigo,
                    incluyéndote si vas a asistir.
                  </p>
                  <label>
                    Pases que usarás
                    <select
                      required
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          e.target.value === '' ? '' : Number(e.target.value)
                        )
                      }
                    >
                      <option value="" disabled>
                        Selecciona una cantidad
                      </option>
                      {Array.from(
                        { length: invitation.nu_PasesAsignados + 1 },
                        (_, n) => (
                          <option key={n} value={n}>
                            {n === 0
                              ? '0 — No asistiré'
                              : `${n} ${n === 1 ? 'pase' : 'pases'}`}
                          </option>
                        )
                      )}
                    </select>
                  </label>
                  <button className="system-primary" type="submit">
                    Revisar y confirmar
                  </button>
                </form>
              )}
            </>
          )}
        </>
      )}
    </WeddingFrame>
  );
}
