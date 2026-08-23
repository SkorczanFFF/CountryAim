import type { CSSProperties } from 'react';
import { ROI } from '~/scanner/roi';
import styles from './ScannerOverlay.module.css';

/**
 * The band is handed to CSS from the same constant the crop uses, so the frame
 * cannot drift away from the region actually being read.
 */
const band = {
  '--roi-inline': `${ROI.width * 100}%`,
  '--roi-block': `${ROI.height * 100}%`,
} as CSSProperties;

export function ScannerOverlay() {
  return (
    <div className={styles.overlay} style={band} aria-hidden="true">
      <div className={styles.window}>
        <span className={styles.line} />
      </div>
    </div>
  );
}
