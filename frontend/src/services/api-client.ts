import type {
  ApiAddMessageResponse,
  ApiAlbum,
  ApiCreateAlbumBody,
  ApiCreatePhotoBody,
  ApiPhoto,
  ApiSendMessageBody,
} from '../models/api-types.js';

/**
 * Thin fetch wrapper around the LensLore Symfony API.
 *
 * Reads `VITE_API_BASE_URL` at build time. In tests, callers can pass an
 * explicit `baseUrl` to bypass the env var.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: ApiClientOptions = {}) {
    const fromEnv =
      typeof import.meta !== 'undefined'
        ? (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL
        : undefined;
    this.baseUrl = (opts.baseUrl ?? fromEnv ?? 'http://localhost:8000').replace(/\/+$/, '');
    this.fetchImpl = opts.fetchImpl ?? fetch.bind(globalThis);
  }

  // ── Albums ─────────────────────────────────────────────────────────────────

  listAlbums(): Promise<ApiAlbum[]> {
    return this.request<ApiAlbum[]>('GET', '/api/albums');
  }

  createAlbum(body: ApiCreateAlbumBody): Promise<ApiAlbum> {
    return this.request<ApiAlbum>('POST', '/api/albums', body);
  }

  listAlbumPhotos(albumId: number): Promise<ApiPhoto[]> {
    return this.request<ApiPhoto[]>('GET', `/api/albums/${albumId}/photos`);
  }

  // ── Photos ─────────────────────────────────────────────────────────────────

  createPhoto(body: ApiCreatePhotoBody): Promise<ApiPhoto> {
    return this.request<ApiPhoto>('POST', '/api/photos', body);
  }

  getPhoto(photoId: number): Promise<ApiPhoto> {
    return this.request<ApiPhoto>('GET', `/api/photos/${photoId}`);
  }

  // ── Messages ───────────────────────────────────────────────────────────────

  sendMessage(photoId: number, body: ApiSendMessageBody): Promise<ApiAddMessageResponse> {
    return this.request<ApiAddMessageResponse>('POST', `/api/photos/${photoId}/messages`, body);
  }

  // ── Internals ──────────────────────────────────────────────────────────────

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const init: RequestInit = {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    };

    const res = await this.fetchImpl(`${this.baseUrl}${path}`, init);

    if (!res.ok) {
      let parsed: unknown = null;
      try {
        parsed = await res.json();
      } catch {
        // Body wasn't JSON — leave parsed as null.
      }
      throw new ApiError(
        `${method} ${path} failed: ${res.status} ${res.statusText}`,
        res.status,
        parsed,
      );
    }

    return (await res.json()) as T;
  }
}
