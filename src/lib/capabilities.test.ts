import { describe, expect, it } from 'vitest';
import { probeCapabilities, selectMissingRequired } from '~/lib/capabilities';

describe('probeCapabilities', () => {
  it('reports every capability exactly once', () => {
    const ids = probeCapabilities().map((capability) => capability.id);
    expect(ids).toHaveLength(11);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('does not throw when browser APIs are missing', () => {
    expect(() => probeCapabilities()).not.toThrow();
  });
});

describe('selectMissingRequired', () => {
  it('keeps only unsupported required capabilities', () => {
    const missing = selectMissingRequired([
      { id: 'getUserMedia', label: 'a', supported: false, required: true },
      { id: 'webAssembly', label: 'b', supported: true, required: true },
      { id: 'popover', label: 'c', supported: false, required: false },
    ]);

    expect(missing.map((capability) => capability.id)).toEqual([
      'getUserMedia',
    ]);
  });
});
