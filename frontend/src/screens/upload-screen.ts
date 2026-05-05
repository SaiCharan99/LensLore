import { bindable, customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { LlTopNav } from '../components/ll-top-nav.js';
import { LlRule } from '../components/ll-rule.js';
import type { SubmitData } from '../models/types.js';

const DEMO_NOTE = 'Standing on the ridge above Torridon just before sunrise. The cloud inversion below me made it feel like the earth had dissolved. I was absolutely alone and it felt like a privilege, not a loneliness.';
const DEMO_IMG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80';

const template = /* html */ `
<div class="upload-screen">
  <ll-top-nav accent="var(--forest)" active-tab="journal" on-navigate.bind="onNavigate"></ll-top-nav>

  <main class="upload-screen__main">
    <!-- Header -->
    <div class="au">
      <p class="upload-screen__eyebrow">May 3, 2026 · New Entry</p>
      <h1 class="upload-screen__heading">
        What did you witness<br/>
        <em>today?</em>
      </h1>
    </div>

    <div class="au2" style="margin-top: 8px; margin-bottom: 36px;">
      <p class="upload-screen__sub">
        Drop a photograph from the field. A few words about the moment.
        Let the journal do the rest.
      </p>
    </div>

    <ll-rule class="au2" style="margin-bottom: 36px;"></ll-rule>

    <!-- Upload zone -->
    <div class="au3">
      <div
        class="upload-zone \${dragOver ? 'upload-zone--drag-over' : ''} \${imageUrl ? 'upload-zone--has-image' : ''}"
        click.trigger="triggerFilePicker()"
        dragover.trigger="handleDragOver($event)"
        dragleave.trigger="handleDragLeave()"
        drop.trigger="handleDrop($event)"
      >
        <input
          type="file"
          accept="image/*"
          ref="fileInput"
          style="display: none;"
          change.trigger="handleFileChange($event)"
        />

        <div if.bind="!imageUrl" class="upload-zone__placeholder">
          <svg class="upload-zone__icon" width="38" height="38" viewBox="0 0 40 40" fill="none">
            <rect x="4" y="11" width="32" height="22" rx="3" stroke="var(--ink)" stroke-width="1.5"/>
            <circle cx="20" cy="22" r="6" stroke="var(--ink)" stroke-width="1.5"/>
            <path d="M14 11 L16 7 H24 L26 11" stroke="var(--ink)" stroke-width="1.5" stroke-linejoin="round"/>
            <circle cx="31" cy="16" r="1.5" fill="var(--ink)" opacity="0.5"/>
          </svg>
          <p class="upload-zone__label">Drop your photograph here</p>
          <p class="upload-zone__hint">or click to browse — JPG, PNG, HEIC</p>
        </div>

        <div if.bind="imageUrl" class="upload-zone__image-wrap">
          <img class="upload-zone__image" src.bind="imageUrl" alt="Uploaded" />
          <button
            class="upload-zone__change-btn"
            click.trigger="changePhoto($event)"
          >Change photo</button>
        </div>
      </div>
    </div>

    <!-- Note -->
    <div class="au4" style="margin-top: 24px;">
      <textarea
        class="note-area"
        ref="noteArea"
        value.bind="note"
        placeholder="Where were you? What were you feeling in that moment?"
        rows="4"
      ></textarea>
      <div class="note-area__counter">\${note.length} characters</div>
    </div>

    <!-- CTA -->
    <div class="au5 cta-row">
      <button
        class="cta-btn \${canSubmit ? 'cta-btn--ready' : ''}"
        click.trigger="handleSubmit()"
      >Uncover the Story</button>

      <button
        if.bind="!imageUrl"
        class="demo-btn"
        click.trigger="handleDemo()"
      >Try with a demo →</button>
    </div>
  </main>
</div>
`;

@customElement({ name: 'upload-screen', template, dependencies: [LlTopNav, LlRule] })
export class UploadScreen implements ICustomElementViewModel {
  @bindable() onSubmit?: (data: SubmitData) => void;
  @bindable() onNavigate?: (tab: string) => void;

  imageUrl: string | null = null;
  note = '';
  dragOver = false;

  fileInput!: HTMLInputElement;

  get canSubmit(): boolean {
    return this.imageUrl !== null && this.note.trim().length > 10;
  }

  triggerFilePicker(): void {
    this.fileInput.click();
  }

  handleDragOver(e: DragEvent): void {
    e.preventDefault();
    this.dragOver = true;
  }

  handleDragLeave(): void {
    this.dragOver = false;
  }

  handleDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragOver = false;
    const file = e.dataTransfer?.files[0];
    if (file) this.loadFile(file);
  }

  handleFileChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.loadFile(file);
  }

  changePhoto(e: MouseEvent): void {
    e.stopPropagation();
    this.fileInput.click();
  }

  private loadFile(file: File): void {
    if (!file.type.startsWith('image/')) return;
    if (this.imageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.imageUrl);
    }
    this.imageUrl = URL.createObjectURL(file);
  }

  handleSubmit(): void {
    if (!this.canSubmit) return;
    this.onSubmit?.({ imageUrl: this.imageUrl, note: this.note });
  }

  handleDemo(): void {
    this.onSubmit?.({ imageUrl: DEMO_IMG, note: DEMO_NOTE });
  }

  detaching(): void {
    if (this.imageUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.imageUrl);
    }
  }
}
