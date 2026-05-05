import { bindable, customElement } from '@aurelia/runtime-html';

const template = /* html */ `
<div class="ll-logo" style.bind="wrapStyle" click.trigger="handleClick()">
  <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="12" stroke.bind="resolvedColor" stroke-width="1.5"/>
    <circle cx="14" cy="14" r="6"  stroke.bind="resolvedColor" stroke-width="1.5"/>
    <circle cx="14" cy="14" r="2"  fill.bind="resolvedColor"/>
    <line x1="14" y1="2"  x2="14" y2="6"  stroke.bind="resolvedColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="14" y1="22" x2="14" y2="26" stroke.bind="resolvedColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="2"  y1="14" x2="6"  y2="14" stroke.bind="resolvedColor" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="22" y1="14" x2="26" y2="14" stroke.bind="resolvedColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>
  <span style="font-size: 18px; font-weight: 500; letter-spacing: 0.02em;">LensLore</span>
</div>
`;

@customElement({ name: 'll-logo', template, dependencies: [] })
export class LlLogo {
  @bindable() color = 'var(--forest)';
  @bindable() onClick?: () => void;

  get resolvedColor(): string {
    return this.color;
  }

  get wrapStyle(): string {
    return `color: ${this.color}; cursor: ${this.onClick ? 'pointer' : 'default'};`;
  }

  handleClick(): void {
    this.onClick?.();
  }
}
