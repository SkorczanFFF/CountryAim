/**
 * Every user-facing string in one place from the first screen onwards, so the
 * locale provider in M4 replaces the lookup behind `t` without touching a single
 * call site. Keys are flat and dotted; grouping is by screen, not by component.
 */
export const pl = {
  'app.name': 'CountryAim',
  'camera.starting': 'Uruchamiam kamerę…',
  'scanner.hint': 'Skieruj aparat na kod kreskowy',
  'camera.error.insecure': 'Kamera działa tylko po HTTPS.',
  'camera.error.unsupported': 'Ta przeglądarka nie udostępnia kamery.',
  'camera.error.denied': 'Brak zgody na dostęp do kamery.',
  'camera.error.notFound': 'Nie znaleziono kamery w tym urządzeniu.',
  'camera.error.notReadable': 'Kamera jest zajęta przez inną aplikację.',
  'camera.error.overconstrained': 'Kamera nie spełnia wymagań podglądu.',
  'camera.error.unknown': 'Nie udało się uruchomić kamery.',
  'readout.invalid': 'Odczyt niepełny',
  'readout.format': 'Format',
  'readout.checksum': 'Suma',
  'readout.checksumOk': 'zgodna',
  'readout.checksumFailed': 'niezgodna',
  'readout.decoder': 'Dekoder',
  'result.close': 'Zamknij',
  'issuer.unassigned': 'Nieznany prefiks',
  'issuer.restrictedDistribution': 'Kod wewnętrzny sklepu',
  'issuer.coupon': 'Kupon rabatowy',
  'issuer.issn': 'Czasopismo (ISSN)',
  'issuer.isbn': 'Książka (ISBN)',
  'issuer.ismn': 'Nuty (ISMN)',
  'issuer.refundReceipt': 'Paragon zwrotu',
  'issuer.gs1GlobalOffice': 'GS1 Global Office',
  'issuer.epcGid': 'Identyfikator EPC',
  'issuer.demo': 'Kod testowy',
  'issuer.reserved': 'Prefiks zarezerwowany',
  'probe.heading': 'Możliwości urządzenia',
  'probe.required': 'wymagane',
  'probe.optional': 'opcjonalne',
  'probe.missing':
    'Brakuje wymaganych funkcji. Skaner nie zadziała na tym urządzeniu.',
} as const;

export type MessageKey = keyof typeof pl;
