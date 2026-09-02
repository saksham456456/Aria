import fs from 'fs';
import path from 'path';

describe('Next.js App Router Error Boundaries & Config', () => {
  it('not-found.tsx exists and contains Next.js App Router 404 elements', () => {
    const filePath = path.join(__dirname, '../../src/app/not-found.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('export default function NotFound');
    expect(content).toContain('bg-surface-0');
    expect(content).toContain('Return to Classroom Lobby');
  });

  it('error.tsx exists and contains client error boundary handler', () => {
    const filePath = path.join(__dirname, '../../src/app/error.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('use client');
    expect(content).toContain('export default function Error');
    expect(content).toContain('reset: () => void');
    expect(content).toContain('Try Again');
  });

  it('global-error.tsx exists and contains root html/body error boundary', () => {
    const filePath = path.join(__dirname, '../../src/app/global-error.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('use client');
    expect(content).toContain('export default function GlobalError');
    expect(content).toContain('<html');
    expect(content).toContain('<body');
    expect(content).toContain('Reload Application');
  });

  it('next.config.mjs contains reactStrictMode: true', () => {
    const filePath = path.join(__dirname, '../../next.config.mjs');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf8');
    expect(content).toContain('reactStrictMode: true');
  });
});
