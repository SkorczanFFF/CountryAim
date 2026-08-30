/**
 * How many reads have to agree before the app calls it a reading. §7.3 starts at
 * two and goes to three if misreads still get through. EAN-13 carries one check
 * digit and no other redundancy, so a symbol read badly — a crease, a glare, a
 * hand moving — can land on a number that passes mod 10 by luck. Two decodes
 * landing on the *same* wrong number is a different order of unlikely.
 */
export const AGREEING = 2;

/**
 * How long a read stays part of a streak. The loop attempts about twelve decodes
 * a second, so agreement normally arrives inside ~100 ms. A second is long
 * enough that a frame the decoder gave up on does not break the streak, and
 * short enough that two reads a minute apart are never mistaken for one.
 */
export const WINDOW_MS = 1000;

export type Stabiliser = {
  /** One decode in. True the moment enough of them have agreed. */
  offer(value: string, now: number): boolean;
};

/**
 * The second of §7.3's two gates: N reads in a row saying the same thing.
 *
 * The check digit is the first gate and stays at the call site, because a
 * reading that fails mod 10 is not a reading and must not count towards a
 * streak. Time is a parameter rather than read in here, so the tests are about
 * the rules and not about a clock.
 */
export function createStabiliser(
  agreeing: number = AGREEING,
  windowMs: number = WINDOW_MS,
): Stabiliser {
  let value: string | undefined;
  let count = 0;
  let at = 0;

  return {
    offer(next, now) {
      const continues = next === value && now - at <= windowMs;
      count = continues ? count + 1 : 1;
      value = next;
      at = now;

      if (count < agreeing) return false;

      // Confirming ends the streak. §7.3 asks for a cooldown after a success so
      // that one frame cannot produce two results; pausing the loop on the
      // freeze does that half, and this is the other — the next reading earns
      // its own agreement instead of inheriting what this one already spent.
      value = undefined;
      count = 0;
      return true;
    },
  };
}
