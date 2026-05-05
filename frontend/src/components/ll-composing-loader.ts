import { bindable, customElement, ICustomElementViewModel } from '@aurelia/runtime-html';

const PHRASES = [
  'Reading the light',
  'Listening to the silence',
  'Choosing the colour',
  'Setting the type',
  'Composing your page',
];

const template = /* html */ `
<div class="composing-loader">
  <svg class="composing-loader__icon" width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="20" stroke.bind="accent" stroke-width="0.8" opacity="0.5"/>
    <circle cx="24" cy="24" r="12" stroke.bind="accent" stroke-width="0.8" opacity="0.7"/>
    <circle cx="24" cy="24" r="3"  fill.bind="accent"/>
  </svg>
  <div>
    <p class="composing-loader__phrase">\${currentPhrase}\${dots}</p>
    <p class="composing-loader__byline">LensLore is composing</p>
  </div>
</div>
`;

@customElement({ name: 'll-composing-loader', template })
export class LlComposingLoader implements ICustomElementViewModel {
  @bindable() accent = '#c4956a';

  currentPhrase = PHRASES[0];
  dots = '';

  private dotInterval: ReturnType<typeof setInterval> | null = null;
  private phraseInterval: ReturnType<typeof setInterval> | null = null;
  private phraseIdx = 0;

  attaching(): void {
    this.dotInterval = setInterval(() => {
      this.dots = this.dots.length >= 3 ? '' : this.dots + '·';
    }, 400);

    this.phraseInterval = setInterval(() => {
      this.phraseIdx = (this.phraseIdx + 1) % PHRASES.length;
      this.currentPhrase = PHRASES[this.phraseIdx];
    }, 1400);
  }

  detaching(): void {
    if (this.dotInterval !== null) clearInterval(this.dotInterval);
    if (this.phraseInterval !== null) clearInterval(this.phraseInterval);
  }
}
