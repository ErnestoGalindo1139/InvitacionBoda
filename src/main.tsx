import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';
import './system.css';
import { TiendaOnlineApp } from './TiendaOnlineApp';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TiendaOnlineApp />
    </BrowserRouter>
  </StrictMode>
);
