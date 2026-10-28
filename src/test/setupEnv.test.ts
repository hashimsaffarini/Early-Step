/// <reference types="node" />
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const script = resolve(process.cwd(), 'scripts/setup-env.mjs');
const roots: string[] = [];
const defaults = 'VITE_API_BASE_URL=https://example.test/api/\nVITE_USE_MOCKS=false\n';
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'early-step-env-'));
  roots.push(root);
  writeFileSync(join(root, '.env.example'), defaults);
  return root;
}
function setup(root: string, url = '') {
  execFileSync(process.execPath, [script], {
    cwd: root,
    env: { ...process.env, VITE_API_BASE_URL: url },
    stdio: 'pipe',
  });
}
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('fresh-clone development setup', () => {
  it('creates .env from the public template on first start', () => {
    const root = fixture();
    setup(root);
    expect(readFileSync(join(root, '.env'), 'utf8')).toBe(defaults);
  });
  it('never overwrites an existing local configuration', () => {
    const root = fixture();
    const custom = 'VITE_API_BASE_URL=https://custom.test/api/\n';
    writeFileSync(join(root, '.env'), custom);
    setup(root);
    expect(readFileSync(join(root, '.env'), 'utf8')).toBe(custom);
  });
  it('respects an API URL provided by the terminal', () => {
    const root = fixture();
    setup(root, 'https://custom.test/api/');
    expect(existsSync(join(root, '.env'))).toBe(false);
  });
});
