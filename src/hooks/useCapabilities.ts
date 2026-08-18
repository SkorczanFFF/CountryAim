import { useMemo } from 'react';
import {
  type Capability,
  probeCapabilities,
  selectMissingRequired,
} from '~/lib/capabilities';

type CapabilityReport = {
  capabilities: Capability[];
  missingRequired: Capability[];
};

export function useCapabilities(): CapabilityReport {
  return useMemo(() => {
    const capabilities = probeCapabilities();
    return {
      capabilities,
      missingRequired: selectMissingRequired(capabilities),
    };
  }, []);
}
