import { bindable, customElement, ICustomElementViewModel } from '@aurelia/runtime-html';

const template = /* html */ `
<div class="fullscreen-photo" css="background: \${bg || '#000'};" click.trigger="close()">
  <img class="fullscreen-photo__bleed" src.bind="src" alt="" aria-hidden="true" />
  <img class="fullscreen-photo__img" src.bind="src" alt="" click.trigger="$event.stopPropagation()" />
  <button class="fullscreen-photo__close" click.trigger="close()">×</button>
  <div class="fullscreen-photo__hint">Esc · tap anywhere to close</div>
</div>
`;

@customElement({ name: 'll-fullscreen-photo', template })
export class LlFullscreenPhoto implements ICustomElementViewModel {
  @bindable() src = '';
  @bindable() bg = '#000';
  @bindable() onClose?: () => void;

  private keyHandler = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') this.close();
  };

  attaching(): void {
    window.addEventListener('keydown', this.keyHandler);
  }

  detaching(): void {
    window.removeEventListener('keydown', this.keyHandler);
  }

  close(): void {
    this.onClose?.();
  }
}
