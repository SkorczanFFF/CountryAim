type CapabilityId =
  | 'secureContext'
  | 'getUserMedia'
  | 'webAssembly'
  | 'cssLightDark'
  | 'barcodeDetector'
  | 'videoFrameCallback'
  | 'cssProperty'
  | 'allowDiscrete'
  | 'dialog'
  | 'viewTransitions'
  | 'vibration';

export type Capability = {
  id: CapabilityId;
  label: string;
  supported: boolean;
  /** Required capabilities have no fallback: the scanner cannot run without them. */
  required: boolean;
};

export function probeCapabilities(): Capability[] {
  return [
    {
      id: 'secureContext',
      label: 'Secure context (HTTPS)',
      supported: window.isSecureContext,
      required: true,
    },
    {
      id: 'getUserMedia',
      label: 'getUserMedia',
      supported: typeof navigator.mediaDevices?.getUserMedia === 'function',
      required: true,
    },
    {
      id: 'webAssembly',
      label: 'WebAssembly',
      supported: typeof WebAssembly !== 'undefined',
      required: true,
    },
    {
      id: 'cssLightDark',
      label: 'CSS light-dark()',
      supported: CSS.supports('color', 'light-dark(white, black)'),
      // Lightning CSS downlevels it, so its absence changes nothing at runtime.
      required: false,
    },
    {
      id: 'barcodeDetector',
      label: 'BarcodeDetector (native)',
      supported: 'BarcodeDetector' in window,
      required: false,
    },
    {
      id: 'videoFrameCallback',
      label: 'requestVideoFrameCallback',
      supported: 'requestVideoFrameCallback' in HTMLVideoElement.prototype,
      required: false,
    },
    {
      id: 'cssProperty',
      label: 'CSS @property',
      supported: 'registerProperty' in CSS,
      required: false,
    },
    {
      id: 'allowDiscrete',
      label: 'transition-behavior: allow-discrete',
      supported: CSS.supports('transition-behavior', 'allow-discrete'),
      required: false,
    },
    {
      id: 'dialog',
      label: '<dialog> showModal()',
      supported: 'showModal' in HTMLDialogElement.prototype,
      required: false,
    },
    {
      id: 'viewTransitions',
      label: 'View Transitions',
      supported: 'startViewTransition' in document,
      required: false,
    },
    {
      id: 'vibration',
      label: 'Vibration API',
      supported: 'vibrate' in navigator,
      required: false,
    },
  ];
}

export function selectMissingRequired(
  capabilities: Capability[],
): Capability[] {
  return capabilities.filter(
    (capability) => capability.required && !capability.supported,
  );
}
