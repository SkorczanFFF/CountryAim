// layers.css must come first so the @layer order is declared before any rule.
import '~/styles/layers.css';
import '~/styles/reset.css';
import '~/styles/tokens.css';
import '~/styles/base.css';
import '@fontsource-variable/space-grotesk/wght.css';
import '@fontsource-variable/kode-mono/wght.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '~/App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Missing #root element');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
