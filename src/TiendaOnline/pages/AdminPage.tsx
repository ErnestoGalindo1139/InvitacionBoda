import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type JSX,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  api,
  ApiError,
  errorMessage,
  type Family,
  type FamilyDraft,
  type FamilySummary,
  type Pass,
} from '../helpers/api';
import { whatsappUrl } from '../helpers/invitacion';
import { WeddingFrame } from '../components/WeddingFrame';
import { FamilyPass } from '../components/FamilyPass';
import { InvitationDirectory } from '../components/InvitationDirectory';
import { QrScanner } from '../components/QrScanner';
import { passToken } from '../helpers/passToken';

const emptyDraft = (): FamilyDraft => ({
  nb_Persona: '',
  nb_Telefono: '',
  nu_PasesAsignados: 1,
});
export function AdminPage(): JSX.Element {
  const [params, setParams] = useSearchParams();
  const qrSection =
    params.get('seccion') === 'qr' ||
    (!params.has('seccion') && params.has('qr'));
  const [user, setUser] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [families, setFamilies] = useState<FamilySummary[]>([]);
  const [selected, setSelected] = useState<Family | null>(null);
  const [draft, setDraft] = useState<FamilyDraft | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const detailDialog = useRef<HTMLDialogElement>(null);
  const [qrToken, setQrToken] = useState(params.get('qr') || '');
  const [pass, setPass] = useState<Pass | null>(null);
  const [lookupError, setLookupError] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const selectionRequest = useRef(0);
  const fail = useCallback((reason: unknown): void => {
    setError(errorMessage(reason));
    if (reason instanceof ApiError && reason.status === 401) {
      setUser(null);
      setDetailOpen(false);
      setSelected(null);
      setDraft(null);
      setFamilies([]);
      setPass(null);
      setLookupError('');
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void api<{ usuario: string }>('/auth/me', { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) setUser(result.usuario);
      })
      .catch((reason) => {
        if (
          !controller.signal.aborted &&
          !(reason instanceof ApiError && reason.status === 401)
        )
          fail(reason);
      })
      .finally(() => {
        if (!controller.signal.aborted) setChecking(false);
      });
    return (): void => controller.abort();
  }, [fail]);
  const refresh = useCallback(
    async (signal?: AbortSignal): Promise<void> => {
      setLoading(true);
      try {
        const data = await api<FamilySummary[]>(
          '/admin/familias?busqueda=&estado=todas',
          { signal }
        );
        if (!signal?.aborted) setFamilies(data);
      } catch (reason) {
        if (!signal?.aborted) fail(reason);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [fail]
  );
  useEffect(() => {
    if (!user || qrSection) return;
    const controller = new AbortController();
    void refresh(controller.signal);
    return (): void => controller.abort();
  }, [user, refresh, qrSection]);
  useEffect(() => {
    const dialog = detailDialog.current;
    if (!dialog) return;
    if (detailOpen && user && !dialog.open) dialog.showModal();
    if ((!detailOpen || !user) && dialog.open) dialog.close();
    if (!detailOpen || !user) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return (): void => {
      document.body.style.overflow = previousOverflow;
    };
  }, [detailOpen, user]);
  function closeDetail(): void {
    if (busy) return;
    setDetailOpen(false);
    setDraft(null);
  }
  async function signIn(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true);
    setError('');
    try {
      const result = await api<{ usuario: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          usuario: values.get('usuario'),
          password: values.get('password'),
        }),
      });
      form.reset();
      setUser(result.usuario);
    } catch (reason) {
      fail(reason);
    } finally {
      setBusy(false);
    }
  }
  async function openFamily(familyId: number): Promise<void> {
    const current = ++selectionRequest.current;
    setDetailOpen(true);
    setBusy(true);
    setError('');
    setNotice('');
    setSelected(null);
    setDraft(null);
    try {
      const family = await api<Family>(`/admin/familias/${familyId}`);
      if (current !== selectionRequest.current) return;
      setSelected(family);
      if (!family.sn_Confirmada)
        setDraft({
          nb_Persona: family.nb_Persona,
          nb_Telefono: family.nb_Telefono || '',
          nu_PasesAsignados: family.nu_PasesAsignados,
        });
    } catch (reason) {
      if (current === selectionRequest.current) fail(reason);
    } finally {
      if (current === selectionRequest.current) setBusy(false);
    }
  }
  async function save(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!draft || busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const family = await api<Family>(
        selected ? `/admin/familias/${selected.id_Familia}` : '/admin/familias',
        { method: selected ? 'PUT' : 'POST', body: JSON.stringify(draft) }
      );
      setSelected(family);
      setDraft(null);
      setNotice('Invitación guardada. Ya puedes compartir su enlace.');
      await refresh();
    } catch (reason) {
      fail(reason);
      if (reason instanceof ApiError && reason.status === 409 && selected)
        await openFamily(selected.id_Familia);
    } finally {
      setBusy(false);
    }
  }
  async function lookup(input: string): Promise<void> {
    if (busy) return;
    setBusy(true);
    setLookingUp(true);
    setError('');
    setLookupError('');
    setPass(null);
    try {
      const value = passToken(input);
      setQrToken(value);
      setPass(await api<Pass>(`/admin/pases/${value}`));
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401) fail(reason);
      else setLookupError(errorMessage(reason));
    } finally {
      setBusy(false);
      setLookingUp(false);
    }
  }
  async function copyLink(): Promise<void> {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.enlace);
      setNotice('Enlace copiado.');
    } catch {
      setNotice('Selecciona el enlace mostrado y cópialo manualmente.');
    }
  }
  async function logout(): Promise<void> {
    setBusy(true);
    setError('');
    try {
      await api('/auth/logout', { method: 'POST' });
      setUser(null);
      setDetailOpen(false);
      setFamilies([]);
      setDraft(null);
      setSelected(null);
      setPass(null);
      setNotice('');
      setLookupError('');
    } catch (reason) {
      fail(reason);
    } finally {
      setBusy(false);
    }
  }
  const whatsapp = selected?.nb_Telefono
    ? whatsappUrl(
        selected.nb_Telefono,
        `Hola, ${selected.nb_Persona}. Te compartimos tu invitación. Tienes ${selected.nu_PasesAsignados} pases asignados. Confirma cuántos usarás una sola vez: ${selected.enlace}`
      )
    : undefined;
  return (
    <WeddingFrame>
      {checking ? (
        <p role="status">Comprobando sesión…</p>
      ) : !user ? (
        <>
          <p className="eyebrow">Organización de la boda</p>
          <h1>Administración</h1>
          {error && (
            <p className="system-error" role="alert">
              {error}
            </p>
          )}
          <form
            className="system-card login-card"
            onSubmit={(e) => void signIn(e)}
          >
            <h2>Iniciar sesión</h2>
            <label>
              Usuario
              <input
                name="usuario"
                autoComplete="username"
                required
                maxLength={150}
              />
            </label>
            <label>
              Contraseña
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
            <button className="system-primary" disabled={busy}>
              {busy ? 'Ingresando…' : 'Entrar al panel'}
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="system-title">
            <div>
              <p className="eyebrow">Panel privado · {user}</p>
              <h1>Personas y pases</h1>
            </div>
            <button disabled={busy} onClick={() => void logout()}>
              Cerrar sesión
            </button>
          </div>
          <nav className="admin-sections" aria-label="Apartados del panel">
            {[
              { value: 'personas', label: 'Invitados', active: !qrSection },
              { value: 'qr', label: 'Lector QR', active: qrSection },
            ].map((section) => (
              <button
                key={section.value}
                type="button"
                aria-pressed={section.active}
                disabled={busy || detailOpen}
                onClick={() => {
                  const next = new URLSearchParams(params);
                  next.set('seccion', section.value);
                  setParams(next);
                  setError('');
                  setNotice('');
                }}
              >
                {section.label}
              </button>
            ))}
          </nav>
          {error && !detailOpen && (
            <p role="alert" className="system-error">
              {error}
            </p>
          )}
          {notice && !detailOpen && (
            <p role="status" className="system-notice">
              {notice}
            </p>
          )}
          <div hidden={qrSection}>
            <InvitationDirectory
              families={families}
              loading={loading}
              busy={busy}
              onOpen={(id) => void openFamily(id)}
              onRefresh={() => void refresh()}
              onNew={() => {
                ++selectionRequest.current;
                setSelected(null);
                setDraft(emptyDraft());
                setNotice('');
                setError('');
                setDetailOpen(true);
              }}
            />
          </div>
          <dialog
            ref={detailDialog}
            className="invitation-dialog"
            aria-labelledby="invitation-detail-heading"
            onCancel={(event) => {
              event.preventDefault();
              closeDetail();
            }}
            onClose={() => setDetailOpen(false)}
          >
            <div className="dialog-heading">
              <h2 id="invitation-detail-heading">
                {selected
                  ? selected.nb_Persona
                  : draft
                    ? 'Nueva persona'
                    : 'Detalle de invitación'}
              </h2>
              <button
                disabled={busy}
                onClick={closeDetail}
                aria-label="Cerrar detalle"
              >
                Cerrar <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="dialog-content">
              {error && (
                <p role="alert" className="system-error">
                  {error}
                </p>
              )}
              {notice && (
                <p role="status" className="system-notice">
                  {notice}
                </p>
              )}
              {busy && <p role="status">Procesando…</p>}
              {!selected && !draft && (
                <p>Selecciona una persona o crea una invitación.</p>
              )}
              {selected && (
                <>
                  <p>
                    {selected.sn_Confirmada
                      ? 'Confirmación definitiva. Los datos están bloqueados.'
                      : 'Pendiente de confirmación.'}
                  </p>
                  <label>
                    Enlace personalizado
                    <input
                      readOnly
                      value={selected.enlace}
                      onFocus={(e) => e.target.select()}
                    />
                  </label>
                  <div className="system-actions">
                    <button onClick={() => void copyLink()}>
                      Copiar enlace
                    </button>
                    {whatsapp ? (
                      <a
                        href={whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Preparar WhatsApp
                      </a>
                    ) : (
                      <span>Sin teléfono de contacto</span>
                    )}
                    {!selected.sn_Confirmada && !draft && (
                      <button
                        disabled={busy}
                        onClick={() => void openFamily(selected.id_Familia)}
                      >
                        Corregir datos
                      </button>
                    )}
                  </div>
                  <p className="system-help">
                    WhatsApp abre un borrador. Debes enviar el mensaje desde la
                    aplicación.
                  </p>
                </>
              )}
              {draft && (
                <form className="family-editor" onSubmit={(e) => void save(e)}>
                  <fieldset disabled={busy}>
                    <label>
                      Nombre de la persona
                      <input
                        required
                        maxLength={150}
                        value={draft.nb_Persona}
                        onChange={(e) =>
                          setDraft({ ...draft, nb_Persona: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Pases asignados
                      <input
                        type="number"
                        min={1}
                        max={50}
                        step={1}
                        required
                        value={
                          Number.isNaN(draft.nu_PasesAsignados)
                            ? ''
                            : draft.nu_PasesAsignados
                        }
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            nu_PasesAsignados: e.target.valueAsNumber,
                          })
                        }
                      />
                    </label>
                    <label>
                      WhatsApp de la persona (opcional)
                      <input
                        inputMode="tel"
                        placeholder="52 y 10 dígitos"
                        pattern="[0-9]{10,15}"
                        maxLength={15}
                        value={draft.nb_Telefono}
                        onChange={(e) =>
                          setDraft({ ...draft, nb_Telefono: e.target.value })
                        }
                      />
                    </label>
                    <p className="system-help">
                      Asigna el total de pases disponibles, incluyendo el de la
                      persona invitada. Podrá confirmar desde 0 hasta ese total.
                    </p>
                    <div className="system-actions">
                      <button className="system-primary" type="submit">
                        {busy ? 'Guardando…' : 'Guardar invitación'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (selected) setDraft(null);
                          else closeDetail();
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </fieldset>
                </form>
              )}
              {selected && !draft && (
                <>
                  <p>
                    {selected.nu_PasesAsignados} pases asignados
                    {selected.sn_Confirmada &&
                      ` · ${selected.nu_PasesConfirmados} confirmados`}
                  </p>
                  {selected.pase && selected.nu_PasesConfirmados !== null ? (
                    <FamilyPass
                      pass={{
                        ...selected,
                        nu_PasesConfirmados: selected.nu_PasesConfirmados,
                        nb_TokenQR: selected.pase.nb_TokenQR,
                      }}
                    />
                  ) : (
                    selected.sn_Confirmada && (
                      <p>Confirmó 0 pases. No se generó pase.</p>
                    )
                  )}
                </>
              )}
            </div>
          </dialog>
          {qrSection && (
            <section className="system-card qr-lookup">
              <h2>Consultar pase por QR</h2>
              <p className="system-help">
                Escanea el QR con la cámara para ver la persona y sus pases
                confirmados.
              </p>
              <QrScanner
                disabled={busy || detailOpen}
                onStart={() => {
                  setPass(null);
                  setLookupError('');
                }}
                onRead={(token) => {
                  setQrToken(token);
                  void lookup(token);
                }}
              />
              <div className="qr-manual-divider">
                <span>O consulta manualmente</span>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void lookup(qrToken);
                }}
              >
                <label>
                  Token QR o enlace leído del código
                  <input
                    value={qrToken}
                    onChange={(e) => setQrToken(e.target.value)}
                    required
                  />
                </label>
                <button className="system-primary" disabled={busy}>
                  {lookingUp ? 'Consultando…' : 'Consultar pase'}
                </button>
              </form>
              {lookupError && (
                <p role="alert" className="system-error">
                  {lookupError}
                </p>
              )}
              {lookingUp && <p role="status">Consultando pase…</p>}
              {pass && (
                <div role="status" className="qr-result">
                  <strong>{pass.nb_Persona}</strong>
                  <span>
                    {pass.nu_PasesConfirmados} pase
                    {pass.nu_PasesConfirmados === 1 ? '' : 's'} confirmado
                    {pass.nu_PasesConfirmados === 1 ? '' : 's'}
                  </span>
                </div>
              )}
              {pass && <FamilyPass pass={pass} />}
            </section>
          )}
        </>
      )}
    </WeddingFrame>
  );
}
