/**
 * Every user-facing string in one place from the first screen onwards, so the
 * locale provider in M4 replaces the lookup behind `t` without touching a single
 * call site. Keys are flat and dotted; grouping is by screen, not by component.
 */
export const pl = {
  'app.name': 'CountryAim',
  'camera.starting': 'Uruchamiam kamerę…',
  'camera.error.insecure': 'Kamera działa tylko po HTTPS.',
  'camera.error.unsupported': 'Ta przeglądarka nie udostępnia kamery.',
  'camera.error.denied': 'Brak zgody na dostęp do kamery.',
  'camera.error.notFound': 'Nie znaleziono kamery w tym urządzeniu.',
  'camera.error.notReadable': 'Kamera jest zajęta przez inną aplikację.',
  'camera.error.overconstrained': 'Kamera nie spełnia wymagań podglądu.',
  'camera.error.unknown': 'Nie udało się uruchomić kamery.',
} as const;

export type MessageKey = keyof typeof pl;
