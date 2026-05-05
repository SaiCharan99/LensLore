import { bindable, customElement } from '@aurelia/runtime-html';
import type { MotifKind } from '../models/types.js';

const template = /* html */ `
<span class="ll-motif" innerhtml.bind="svgContent"></span>
`;

@customElement({ name: 'll-motif', template })
export class LlMotif {
  @bindable() kind: MotifKind = 'horizon-rule';
  @bindable() color = '#888';

  get svgContent(): string {
    const c = this.color;
    switch (this.kind) {
      case 'horizon-rule':
        return `<svg width="120" height="14" viewBox="0 0 120 14" fill="none">
          <line x1="0" y1="7" x2="42" y2="7" stroke="${c}" stroke-width="0.8"/>
          <circle cx="60" cy="7" r="2" fill="${c}"/>
          <line x1="50" y1="7" x2="54" y2="7" stroke="${c}" stroke-width="0.8"/>
          <line x1="66" y1="7" x2="70" y2="7" stroke="${c}" stroke-width="0.8"/>
          <line x1="78" y1="7" x2="120" y2="7" stroke="${c}" stroke-width="0.8"/>
        </svg>`;
      case 'ornamental-flourish':
        return `<svg width="80" height="20" viewBox="0 0 80 20" fill="none">
          <path d="M0,10 Q20,2 40,10 T80,10" stroke="${c}" stroke-width="0.8" fill="none"/>
          <circle cx="40" cy="10" r="1.6" fill="${c}"/>
        </svg>`;
      case 'rain-streaks':
        return `<svg width="40" height="60" viewBox="0 0 40 60" fill="none">
          <line x1="0"  y1="0"  x2="-4" y2="45" stroke="${c}" stroke-width="0.6" opacity="0.4"/>
          <line x1="8"  y1="4"  x2="4"  y2="47" stroke="${c}" stroke-width="0.6" opacity="0.5"/>
          <line x1="16" y1="8"  x2="12" y2="49" stroke="${c}" stroke-width="0.6" opacity="0.6"/>
          <line x1="24" y1="12" x2="20" y2="51" stroke="${c}" stroke-width="0.6" opacity="0.7"/>
          <line x1="32" y1="16" x2="28" y2="53" stroke="${c}" stroke-width="0.6" opacity="0.8"/>
        </svg>`;
      case 'small-crest':
        return `<svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="14" stroke="${c}" stroke-width="0.8"/>
          <circle cx="20" cy="20" r="3" fill="${c}"/>
          <line x1="20" y1="2"  x2="20" y2="8"  stroke="${c}" stroke-width="0.8"/>
          <line x1="20" y1="32" x2="20" y2="38" stroke="${c}" stroke-width="0.8"/>
        </svg>`;
      case 'thin-lines':
        return `<svg width="60" height="20" viewBox="0 0 60 20" fill="none">
          <line x1="0" y1="3"  x2="60" y2="3"  stroke="${c}" stroke-width="0.5" opacity="1"/>
          <line x1="0" y1="8"  x2="60" y2="8"  stroke="${c}" stroke-width="0.5" opacity="0.75"/>
          <line x1="0" y1="13" x2="60" y2="13" stroke="${c}" stroke-width="0.5" opacity="0.5"/>
        </svg>`;
      case 'tide-line':
        return `<svg width="120" height="8" viewBox="0 0 120 8" fill="none">
          <path d="M0,4 Q15,1 30,4 T60,4 T90,4 T120,4" stroke="${c}" stroke-width="0.6" fill="none"/>
        </svg>`;
      case 'storm-line':
        return `<svg width="80" height="40" viewBox="0 0 80 40" fill="none">
          <path d="M0,20 L20,12 L30,28 L50,8 L60,24 L80,16" stroke="${c}" stroke-width="0.8" fill="none"/>
        </svg>`;
      default:
        return `<div style="width:40px;height:1px;background:${c};display:inline-block;"></div>`;
    }
  }
}
