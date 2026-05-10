import { describe, it, expect, vi } from 'vitest';

import { ApiClient, ApiError } from '../src/services/api-client.js';
import type { ApiAlbum, ApiPhoto } from '../src/models/api-types.js';

function buildClient(fetchImpl: typeof fetch): ApiClient {
  return new ApiClient({ baseUrl: 'http://api.test', fetchImpl });
}

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('ApiClient', () => {
  it('listAlbums hits GET /api/albums and returns parsed body', async () => {
    const albums: ApiAlbum[] = [
      { id: 1, title: 'Highland Edges', date: '14 March 2026', coverImg: 'https://cdn.test/a1', photoCount: 3 },
    ];
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(albums));

    const client = buildClient(fetchImpl);
    const result = await client.listAlbums();

    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('http://api.test/api/albums');
    expect(init?.method).toBe('GET');
    expect(init?.body).toBeUndefined();
    expect(result).toEqual(albums);
  });

  it('createAlbum sends POST with JSON body', async () => {
    const created: ApiAlbum = { id: 2, title: 'New Album', date: '10 May 2026', coverImg: null, photoCount: 0 };
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(created, { status: 201 }));

    const client = buildClient(fetchImpl);
    const result = await client.createAlbum({ title: 'New Album' });

    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe('http://api.test/api/albums');
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(init?.body).toBe('{"title":"New Album"}');
    expect(result).toEqual(created);
  });

  it('getPhoto encodes the id in the path', async () => {
    const photo: ApiPhoto = {
      id: 42,
      albumId: 1,
      img: 'https://cdn.test/img',
      thumb: 'https://cdn.test/thumb',
      note: 'A quiet morning.',
      date: '10 May 2026',
      storySpec: null,
      messages: [],
    };
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(photo));

    const client = buildClient(fetchImpl);
    await client.getPhoto(42);

    expect(fetchImpl.mock.calls[0]![0]).toBe('http://api.test/api/photos/42');
  });

  it('throws ApiError with status + parsed body on a 422', async () => {
    const errorBody = { errors: { note: 'Note must be at least 10 characters.' } };
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(errorBody, { status: 422, statusText: 'Unprocessable Entity' }));

    const client = buildClient(fetchImpl);

    await expect(
      client.createPhoto({ imageBase64: 'x', note: '', mood: '', albumId: 1 }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 422,
      body: errorBody,
    });
  });

  it('still throws ApiError when the error body is not JSON', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response('Internal Server Error', { status: 500, statusText: 'Internal Server Error' }),
    );

    const client = buildClient(fetchImpl);

    await expect(client.listAlbums()).rejects.toBeInstanceOf(ApiError);
  });

  it('strips trailing slashes from baseUrl so paths concatenate cleanly', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse([]));
    const client = new ApiClient({ baseUrl: 'http://api.test/', fetchImpl });

    await client.listAlbums();

    expect(fetchImpl.mock.calls[0]![0]).toBe('http://api.test/api/albums');
  });
});
