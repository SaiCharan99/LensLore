import { bindable, customElement } from '@aurelia/runtime-html';
import { LlLogo } from './ll-logo.js';

const template = /* html */ `
<nav class="top-nav">
  <ll-logo color.bind="accent" on-click.bind="handleLogoClick"></ll-logo>
  <div class="top-nav__tabs">
    <button
      class="top-nav__tab \${activeTab === 'journal' || activeTab === 'upload' ? 'top-nav__tab--active' : ''}"
      css="color: \${activeTab === 'journal' || activeTab === 'upload' ? accent : 'var(--ink-soft)'}; border-bottom-color: \${activeTab === 'journal' || activeTab === 'upload' ? accent : 'transparent'};"
      click.trigger="navigate('journal')"
    >Journal</button>
    <button
      class="top-nav__tab \${activeTab === 'albums' || activeTab === 'album-detail' ? 'top-nav__tab--active' : ''}"
      css="color: \${activeTab === 'albums' || activeTab === 'album-detail' ? accent : 'var(--ink-soft)'}; border-bottom-color: \${activeTab === 'albums' || activeTab === 'album-detail' ? accent : 'transparent'};"
      click.trigger="navigate('albums')"
    >Albums</button>
    <button class="top-nav__new-btn" css="background: \${accent};" click.trigger="navigate('upload')">
      + New Entry
    </button>
  </div>
</nav>
`;

@customElement({ name: 'll-top-nav', template, dependencies: [LlLogo] })
export class LlTopNav {
  @bindable() accent = 'var(--forest)';
  @bindable() activeTab = 'journal';
  @bindable() onNavigate?: (tab: string) => void;

  navigate(tab: string): void {
    this.onNavigate?.(tab);
  }

  handleLogoClick = (): void => {
    this.onNavigate?.('upload');
  };
}
