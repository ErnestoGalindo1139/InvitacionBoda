import { Route, Routes } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';

export const TiendaOnlineRoutes = () => {
  return (
    <>
      {/* Aqui va el NavbarComponent */}

      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>

      {/* Aqui va el FooterComponent */}
    </>
  );
};
