import { LOCALE, t } from '~/i18n/t';
import { countryName, regionName } from '~/lib/countryName';
import { type BarcodeFormat, parseGtin } from '~/lib/gtin';
import { lookupPrefix } from '~/lib/lookup';
import type { Scan } from '~/scanner/detector';
import styles from './Readout.module.css';

const FORMAT_LABEL: Record<BarcodeFormat, string> = {
  ean_13: 'EAN-13',
  ean_8: 'EAN-8',
  upc_a: 'UPC-A',
  upc_e: 'UPC-E',
};

/**
 * How many of the printed digits carry the GS1 prefix. A UPC-A prints twelve but
 * is read as an EAN-13 with a leading zero, so two of its digits do the work of
 * three; a UPC-E prints its digits compressed, so none of them line up.
 */
function prefixLength(format: BarcodeFormat): number {
  if (format === 'upc_a') return 2;
  if (format === 'upc_e') return 0;
  return 3;
}

type ReadoutProps = {
  scan: Scan;
  decoder: 'native' | 'wasm' | undefined;
};

export function Readout({ scan, decoder }: ReadoutProps) {
  const split = prefixLength(scan.format);
  const parsed = parseGtin(scan.value, scan.format);
  const range = parsed.ok ? lookupPrefix(parsed.value.prefixSource) : undefined;

  const issuer = !parsed.ok
    ? t('readout.invalid')
    : !range
      ? t('issuer.unassigned')
      : range.kind === 'country'
        ? countryName(range.iso, LOCALE)
        : range.kind === 'region'
          ? regionName(range.isos, LOCALE)
          : t(`issuer.${range.key}`);

  return (
    // Keyed on the value so a new reading replays the resolve.
    <div className={styles.readout} key={scan.value}>
      <p className={styles.issuer}>{issuer}</p>

      <p className={styles.code}>
        {split > 0 && (
          <span className={styles.prefix}>{scan.value.slice(0, split)}</span>
        )}
        <span className={styles.rest}>{scan.value.slice(split)}</span>
      </p>

      <dl className={styles.status}>
        <div className={styles.reading}>
          <dt>{t('readout.format')}</dt>
          <dd>{FORMAT_LABEL[scan.format]}</dd>
        </div>
        <div className={styles.reading}>
          <dt>{t('readout.checksum')}</dt>
          <dd data-failed={!parsed.ok || undefined}>
            {parsed.ok ? t('readout.checksumOk') : t('readout.checksumFailed')}
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
