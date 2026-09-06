import { Route, Routes } from 'react-router-dom';
import { TiendaOnlineRoutes } from '../TiendaOnline/routes/TiendaOnlineRoutes';

export const AppRouter = () => {
  return (
    <>
      <Routes>
        <Route path="/*" element={<TiendaOnlineRoutes />} />
      </Routes>
    </>
  );
};
