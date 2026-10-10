import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { applyTheme, getStoredThemeMode, getStoredThemeColor } from './utils/theme';

// Pre-initialize stored theme before first paint
applyTheme(getStoredThemeMode(), getStoredThemeColor());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
