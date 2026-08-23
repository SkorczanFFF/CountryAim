import type { CSSProperties } from 'react';
import { ROI } from '~/scanner/roi';
import styles from './ScannerOverlay.module.css';

/** Same constant the crop uses, so the frame cannot drift off the read region. */
const band = {
  '--roi-inline': `${ROI.width * 100}%`,
  '--roi-block': `${ROI.height * 100}%`,
} as CSSProperties;

const CORNERS = ['tl', 'tr', 'bl', 'br'] as const;

export function ScannerOverlay() {
  return (
    <div className={styles.overlay} style={band} aria-hidden="true">
      <div className={styles.window}>
        {/* The laser needs clipping, the brackets need to escape: separate boxes. */}
        <div className={styles.slot}>
          <div className={styles.laser} />
        </div>
        {CORNERS.map((at) => (
          <span key={at} className={styles.corner} data-at={at} />
        ))}
      </div>
    </div>
  );
}
