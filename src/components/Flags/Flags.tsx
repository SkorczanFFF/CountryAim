import type { CSSProperties } from 'react';
import { ROI } from '~/scanner/roi';
import styles from './Flags.module.css';
import { flagUrl } from './flagUrls';

/** The strip fills the space above the band and hangs its flags off the bottom. */
const above = {
  '--band-top': `${50 - ROI.height * 50}%`,
} as CSSProperties;

type FlagsProps = {
  isos: readonly string[];
};

export function Flags({ isos }: FlagsProps) {
  const flags = isos.flatMap((iso) => {
    const url = flagUrl(iso);
    return url ? [{ iso, url }] : [];
  });

  if (flags.length === 0) return null;

  return (
    <div className={styles.flags} style={above} aria-hidden="true">
      {flags.map(({ iso, url }) => (
        <img key={iso} className={styles.flag} src={url} alt="" />
      ))}
    </div>
  );
}
