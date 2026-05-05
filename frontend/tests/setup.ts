import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
});

globalThis.document = dom.window.document;
globalThis.window = dom.window as unknown as Window & typeof globalThis;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.Image = dom.window.Image;
