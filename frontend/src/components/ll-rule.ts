import { customElement } from '@aurelia/runtime-html';

const template = /* html */ `
<div class="ll-rule">
  <div class="ll-rule__line"></div>
  <div class="ll-rule__dot"></div>
  <div class="ll-rule__line"></div>
</div>
`;

@customElement({ name: 'll-rule', template })
export class LlRule {}
