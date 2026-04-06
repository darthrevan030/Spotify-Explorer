import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './store/appContext';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { inject } from "@vercel/analytics"
import App from './App';
import './styles/tokens.css';
import './styles/base.css';

const root = document.getElementById('root');
if (!root) throw new Error('No #root element found');

// Vercel Analytics
inject();
injectSpeedInsights();

createRoot(root).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
);
