import Aurelia from 'aurelia';
import { AppRoot } from './app-root.js';
import './styles/global.css';

// `Aurelia.start()` returns `void | Promise<void>` — wrap so we can attach a
// catch handler without conditional type-narrowing.
Promise.resolve(
  Aurelia.app({
    host: document.querySelector('app-root') as HTMLElement,
    component: AppRoot,
  }).start(),
).catch((err: unknown) => {
  // eslint-disable-next-line no-console
  console.error('[LensLore] Aurelia failed to start:', err);
});
