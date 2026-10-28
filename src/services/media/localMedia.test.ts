import { clearLocalMedia, mediaKeys, readLocalMedia, saveLocalMedia } from './localMedia';

const image = () => new File(['image-bytes'], 'example.png', { type: 'image/png' });
afterEach(async () => {
  await clearLocalMedia();
  vi.unstubAllGlobals();
});

describe('temporary local content images', () => {
  it('keeps the uploaded file available by its real entity id and known server path', async () => {
    const file = image();
    await saveLocalMedia(mediaKeys.option('o1'), file, '/uploads/missing.png');
    expect(await readLocalMedia(mediaKeys.option('o1'))).toBe(file);
    expect(await readLocalMedia(undefined, '/uploads/missing.png')).toBe(file);
    expect(await readLocalMedia(mediaKeys.option('unrelated'))).toBeNull();
  });
  it('keeps an existing copy when an edit has no new file', async () => {
    const file = image();
    await saveLocalMedia(mediaKeys.question('q1'), file);
    await saveLocalMedia(mediaKeys.question('q1'), null);
    expect(await readLocalMedia(mediaKeys.question('q1'))).toBe(file);
  });
  it('keeps the current-visit copy even if persistent storage is denied', async () => {
    vi.stubGlobal('caches', { open: () => Promise.reject(new Error('denied')) });
    const file = image();
    await saveLocalMedia(mediaKeys.option('denied'), file);
    expect(await readLocalMedia(mediaKeys.option('denied'))).toBe(file);
  });
  it('restores the actual image bytes from browser storage after the module reloads', async () => {
    const responses = new Map<string, Response>();
    const cache = {
      put: (key: string, response: Response) => {
        responses.set(key, response.clone());
        return Promise.resolve();
      },
      match: (key: string) => Promise.resolve(responses.get(key)?.clone()),
      keys: () => Promise.resolve([...responses.keys()].map((key) => new Request(key))),
      delete: (key: string | Request) =>
        Promise.resolve(responses.delete(typeof key === 'string' ? key : key.url)),
    };
    vi.stubGlobal('caches', {
      open: () => Promise.resolve(cache),
      delete: () => {
        responses.clear();
        return Promise.resolve(true);
      },
    });
    await saveLocalMedia(mediaKeys.option('persisted'), image());
    vi.resetModules();
    const reloaded = await import('./localMedia');
    const restored = await reloaded.readLocalMedia(mediaKeys.option('persisted'));
    expect(restored?.type).toBe('image/png');
    expect(await restored?.text()).toBe('image-bytes');
    await reloaded.clearLocalMedia();
  });
});
