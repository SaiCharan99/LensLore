import Aurelia from 'aurelia';
import { AppRoot } from './app-root.js';
import './styles/global.css';

Aurelia
  .app({
    host: document.querySelector('app-root') as HTMLElement,
    component: AppRoot,
  })
  .start()
  .catch((err: unknown) => {
    // eslint-disable-next-line no-console
    console.error('[LensLore] Aurelia failed to start:', err);
  });
