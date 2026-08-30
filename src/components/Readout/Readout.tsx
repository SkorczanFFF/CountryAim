import type { Reading } from '~/i18n/reading';
import { t } from '~/i18n/t';
import styles from './Readout.module.css';

type ReadoutProps = {
  reading: Reading;
  decoder: 'native' | 'wasm' | undefined;
  onClose: () => void;
};

export function Readout({ reading, decoder, onClose }: ReadoutProps) {
  return (
    <div className={styles.readout}>
      <p className={styles.issuer}>{reading.issuer}</p>

      <p className={styles.code}>
        {reading.prefix && (
          <span className={styles.prefix}>{reading.prefix}</span>
        )}
        <span className={styles.rest}>{reading.rest}</span>
      </p>

      <dl className={styles.status}>
        <div className={styles.reading}>
          <dt>{t('readout.format')}</dt>
          <dd>{reading.format}</dd>
        </div>
        <div className={styles.reading}>
          <dt>{t('readout.checksum')}</dt>
          <dd data-failed={!reading.valid || undefined}>
            {reading.valid
              ? t('readout.checksumOk')
              : t('readout.checksumFailed')}
          </dd>
        </div>
        {decoder && (
          <div className={styles.reading}>
            <dt>{t('readout.decoder')}</dt>
            <dd>{decoder}</dd>
          </div>
        )}
      </dl>

      {/* The only way out of a frozen frame, so it gets the full width of the
          panel and the bottom of the screen, where a thumb already is. */}
      <button type="button" className={styles.close} onClick={onClose}>
        {t('result.close')}
      </button>
    </div>
  );
}
