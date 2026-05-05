import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';

const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  plugins: [
    aurelia({
      useDev: isDev,
    }),
  ],
  esbuild: {
    // Force esbuild to transpile TC39 class decorators rather than pass them through
    // as native syntax. Without this, Vite dev mode uses 'esnext' internally and
    // leaves @customElement / @bindable as raw browser decorators, which fail on
    // Safari ≤17 and any browser without full TC39 decorator support. This aligns
    // dev behaviour with the production build (which already targets es2022).
    target: 'es2022',
  },
  server: {
    port: 3000,
    open: false,
  },
  build: {
    sourcemap: true,
    target: 'es2022',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
