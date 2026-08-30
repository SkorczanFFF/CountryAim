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

      {/* §2, and the one line in the app that exists purely to stop a
          misreading: a country's name under a barcode is read as "made there"
          unless something says otherwise. On screen always and never behind a
          control — a disclosure that has to be opened is one most people never
          open.
          Drawn only where a country is actually named. An ISBN or a shop's own
          code has no origin to be confused about, and a correction of something
          nobody was about to think is just noise. Same condition as the flag,
          which is no coincidence: both follow from the reading naming a place. */}
      {reading.isos.length > 0 && (
        <p className={styles.registration}>
          {/* Tabler's own `info-circle` geometry, inlined. The library lands at
              commit 20 and §4.7 flags that it needs `optimizeDeps` tuning to
              come with it, which one glyph does not justify pulling forward;
              same 24×24 stroke grid, so dropping in <IconInfoCircle stroke={2}
              /> then changes nothing on screen. A circle and not §4.7's alert
              triangle: this is true of every correct reading, and a warning that
              never turns off is a warning people stop seeing. */}
          <svg className={styles.info} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
            <path d="M12 9h.01" />
            <path d="M11 12h1v4h1" />
          </svg>
          {t('result.disclaimer')}
        </p>
      )}

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
