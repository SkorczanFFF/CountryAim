import type { Capability } from '~/lib/capabilities';
import styles from './CapabilityReport.module.css';

type CapabilityRowProps = {
  capability: Capability;
};

function CapabilityRow({ capability }: CapabilityRowProps) {
  const state = capability.supported
    ? 'supported'
    : capability.required
      ? 'missing'
      : 'absent';

  return (
    <li className={styles.row}>
      <span className={styles.dot} data-state={state} />
      <span className={styles.label}>{capability.label}</span>
      <span className={styles.tag}>
        {capability.required ? 'required' : 'optional'}
      </span>
    </li>
  );
}

type CapabilityReportProps = {
  capabilities: Capability[];
  missingRequired: Capability[];
};

export function CapabilityReport({
  capabilities,
  missingRequired,
}: CapabilityReportProps) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.heading}>Device capabilities</h2>

      {missingRequired.length > 0 && (
        <p className={styles.alert} role="alert">
          {missingRequired.length} required feature(s) missing. The scanner will
          not work on this device.
        </p>
      )}

      <ul className={styles.list}>
        {capabilities.map((capability) => (
          <CapabilityRow key={capability.id} capability={capability} />
        ))}
      </ul>
    </section>
  );
}
