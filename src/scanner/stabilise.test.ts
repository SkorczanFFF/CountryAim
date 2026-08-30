import { describe, expect, it } from 'vitest';
import { createStabiliser, WINDOW_MS } from '~/scanner/stabilise';

const CODE = '5901234123457';
const OTHER = '5901234123464';

describe('createStabiliser', () => {
  it('does not take the first read on its own', () => {
    expect(createStabiliser().offer(CODE, 0)).toBe(false);
  });

  it('confirms once enough reads agree', () => {
    const gate = createStabiliser();
    gate.offer(CODE, 0);

    expect(gate.offer(CODE, 80)).toBe(true);
  });

  it('starts over when a read disagrees', () => {
    // The whole point of the gate: one bad decode between two good ones must not
    // leave the good ones counting towards each other.
    const gate = createStabiliser();
    gate.offer(CODE, 0);
    gate.offer(OTHER, 80);

    expect(gate.offer(CODE, 160)).toBe(false);
  });

  it('drops a streak older than the window', () => {
    const gate = createStabiliser();
    gate.offer(CODE, 0);

    expect(gate.offer(CODE, WINDOW_MS + 1)).toBe(false);
  });

  it('keeps a streak alive at the edge of the window', () => {
    const gate = createStabiliser();
    gate.offer(CODE, 0);

    expect(gate.offer(CODE, WINDOW_MS)).toBe(true);
  });

  it('makes the reading after a confirmation earn its own agreement', () => {
    // Without this the decode landing 80 ms later inherits the streak already
    // spent and fires a second result off the same code.
    const gate = createStabiliser();
    gate.offer(CODE, 0);
    gate.offer(CODE, 80);

    expect(gate.offer(CODE, 160)).toBe(false);
    expect(gate.offer(CODE, 240)).toBe(true);
  });

  it('takes three when three are asked for', () => {
    const gate = createStabiliser(3);
    gate.offer(CODE, 0);

    expect(gate.offer(CODE, 80)).toBe(false);
    expect(gate.offer(CODE, 160)).toBe(true);
  });
});
