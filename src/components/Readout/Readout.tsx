import type { Reading } from '~/i18n/reading';
import { t } from '~/i18n/t';
import styles from './Readout.module.css';

type ReadoutProps = {
  reading: Reading;
  decoder: 'native' | 'wasm' | undefined;
};

export function Readout({ reading, decoder }: ReadoutProps) {
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
    </div>
  );
}
