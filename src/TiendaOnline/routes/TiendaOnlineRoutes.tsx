import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { WeddingFrame } from '../components/WeddingFrame';

const FamilyInvitationPage = lazy(() =>
  import('../pages/FamilyInvitationPage').then((module) => ({
    default: module.FamilyInvitationPage,
  }))
);
const AdminPage = lazy(() =>
  import('../pages/AdminPage').then((module) => ({ default: module.AdminPage }))
);

export const TiendaOnlineRoutes = () => {
  return (
    <>
      {/* Aqui va el NavbarComponent */}

      <Suspense
        fallback={
          <WeddingFrame>
            <p role="status">Cargando…</p>
          </WeddingFrame>
        }
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/invitacion/:token" element={<FamilyInvitationPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route
            path="*"
            element={
              <WeddingFrame>
                <h1>Página no encontrada</h1>
                <p>Revisa el enlace recibido.</p>
              </WeddingFrame>
            }
          />
        </Routes>
      </Suspense>

      {/* Aqui va el FooterComponent */}
    </>
  );
};
