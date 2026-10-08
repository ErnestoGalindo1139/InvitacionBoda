import { useMemo, useRef, useState, type JSX } from 'react';
import type { FamilySummary } from '../helpers/api';

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es')
    .trim();
const byName = (a: FamilySummary, b: FamilySummary): number =>
  a.nb_Persona.localeCompare(b.nb_Persona, 'es', { sensitivity: 'base' }) ||
  a.id_Familia - b.id_Familia;

export function InvitationDirectory({
  families,
  loading,
  busy,
  onOpen,
  onNew,
  onRefresh,
}: {
  families: FamilySummary[];
  loading: boolean;
  busy: boolean;
  onOpen: (id: number) => void;
  onNew: () => void;
  onRefresh: () => void;
}): JSX.Element {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('todas');
  const [order, setOrder] = useState('nombre');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const directory = useRef<HTMLElement>(null);
  const totals = useMemo(
    () =>
      families.reduce(
        (result, person) => ({
          assigned: result.assigned + person.nu_PasesAsignados,
          confirmed: result.confirmed + (person.nu_PasesConfirmados ?? 0),
          pending: result.pending + Number(!person.sn_Confirmada),
        }),
        { assigned: 0, confirmed: 0, pending: 0 }
      ),
    [families]
  );
  const filtered = useMemo(
    () =>
      families
        .filter(
          (person) =>
            normalize(person.nb_Persona).includes(normalize(search)) &&
            (status === 'todas' ||
              (status === 'pendientes' && !person.sn_Confirmada) ||
              (status === 'confirmadas' && person.sn_Confirmada) ||
              (status === 'sin-asistencia' &&
                person.sn_Confirmada &&
                person.nu_PasesConfirmados === 0))
        )
        .sort((a, b) => {
          if (order === 'pases')
            return b.nu_PasesAsignados - a.nu_PasesAsignados || byName(a, b);
          if (order === 'pendientes')
            return (
              Number(a.sn_Confirmada) - Number(b.sn_Confirmada) || byName(a, b)
            );
          return byName(a, b);
        }),
    [families, search, status, order]
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const offset = (currentPage - 1) * pageSize;
  const visible = filtered.slice(offset, offset + pageSize);
  const changePage = (nextPage: number): void => {
    setPage(nextPage);
    if (directory.current && directory.current.getBoundingClientRect().top < 0)
      directory.current.scrollIntoView({ block: 'start' });
  };
  const reset = (): void => {
    setSearch('');
    setStatus('todas');
    setPage(1);
  };
  return (
    <>
      <dl
        className="admin-summary"
        aria-label="Resumen de todas las invitaciones"
        aria-busy={loading}
      >
        <div>
          <dt>Personas invitadas</dt>
          <dd>{loading ? '—' : families.length}</dd>
        </div>
        <div>
          <dt>Pases asignados</dt>
          <dd>{loading ? '—' : totals.assigned}</dd>
        </div>
        <div>
          <dt>Pases confirmados</dt>
          <dd>{loading ? '—' : totals.confirmed}</dd>
        </div>
        <div>
          <dt>Personas por responder</dt>
          <dd>{loading ? '—' : totals.pending}</dd>
        </div>
      </dl>
      <section
        ref={directory}
        className="system-card invitation-directory"
        aria-labelledby="directory-heading"
      >
        <div className="directory-heading">
          <div>
            <h2 id="directory-heading">Invitaciones</h2>
            <p className="system-help">
              Encuentra una persona y abre su invitación para ver o corregir sus
              datos.
            </p>
          </div>
          <div className="system-actions">
            <button disabled={loading || busy} onClick={onRefresh}>
              Actualizar
            </button>
            <button className="system-primary" disabled={busy} onClick={onNew}>
              + Nueva persona
            </button>
          </div>
        </div>
        <div className="directory-filters">
          <label>
            Buscar por nombre
            <input
              type="search"
              placeholder="Escribe un nombre…"
              value={search}
              maxLength={150}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <label>
            Estado
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="todas">Todas</option>
              <option value="pendientes">Pendientes</option>
              <option value="confirmadas">Confirmadas</option>
              <option value="sin-asistencia">Sin asistencia</option>
            </select>
          </label>
          <label>
            Ordenar por
            <select
              value={order}
              onChange={(e) => {
                setOrder(e.target.value);
                setPage(1);
              }}
            >
              <option value="nombre">Nombre: A a Z</option>
              <option value="pases">Más pases primero</option>
              <option value="pendientes">Pendientes primero</option>
            </select>
          </label>
        </div>
        {loading ? (
          <p role="status" className="directory-empty">
            Cargando personas…
          </p>
        ) : (
          <>
            <div className="directory-result">
              <p role="status">
                {filtered.length} de {families.length} personas
              </p>
              {(search || status !== 'todas') && (
                <button onClick={reset}>Limpiar filtros</button>
              )}
            </div>
            {visible.length ? (
              <table className="invitation-table">
                <caption className="visually-hidden">
                  Personas invitadas y sus pases
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Persona</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Asignados</th>
                    <th scope="col">Confirmados</th>
                    <th scope="col">
                      <span className="visually-hidden">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((person) => (
                    <tr key={person.id_Familia}>
                      <th scope="row">{person.nb_Persona}</th>
                      <td className="invitation-state">
                        <span
                          className={`status-badge ${!person.sn_Confirmada ? 'pending' : person.nu_PasesConfirmados === 0 ? 'declined' : 'confirmed'}`}
                        >
                          {!person.sn_Confirmada
                            ? 'Pendiente'
                            : person.nu_PasesConfirmados === 0
                              ? 'Sin asistencia'
                              : 'Confirmada'}
                        </span>
                      </td>
                      <td className="invitation-quantity">
                        <span className="mobile-cell-label" aria-hidden="true">
                          Asignados
                        </span>
                        {person.nu_PasesAsignados}
                      </td>
                      <td className="invitation-quantity">
                        <span className="mobile-cell-label" aria-hidden="true">
                          Confirmados
                        </span>
                        {person.sn_Confirmada ? (
                          (person.nu_PasesConfirmados ?? 0)
                        ) : (
                          <span aria-label="Sin respuesta">—</span>
                        )}
                      </td>
                      <td className="invitation-action">
                        <button
                          disabled={busy}
                          aria-label={`Ver invitación de ${person.nb_Persona}`}
                          onClick={() => onOpen(person.id_Familia)}
                        >
                          Ver invitación <span aria-hidden="true">↗</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="directory-empty">
                <h3>
                  {families.length
                    ? 'No hay coincidencias'
                    : 'Aún no hay invitaciones'}
                </h3>
                <p>
                  {families.length
                    ? 'Prueba otro nombre o cambia el estado.'
                    : 'Crea la primera persona para asignarle sus pases.'}
                </p>
              </div>
            )}
            <div className="directory-pagination">
              <label>
                Mostrar
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                </select>
              </label>
              <p>
                {filtered.length
                  ? `${offset + 1}–${offset + visible.length} de ${filtered.length}`
                  : '0 resultados'}
              </p>
              <nav aria-label="Páginas de invitaciones">
                <button
                  disabled={currentPage === 1}
                  onClick={() => changePage(currentPage - 1)}
                >
                  Anterior
                </button>
                <span aria-live="polite">
                  Página {currentPage} de {pages}
                </span>
                <button
                  disabled={currentPage === pages}
                  onClick={() => changePage(currentPage + 1)}
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </>
        )}
      </section>
    </>
  );
}
