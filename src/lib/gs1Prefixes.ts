/**
 * GS1 prefix ranges.
 *
 * Bounds are written the way the GS1 table prints them and widened to a common
 * four-digit space, because four digits is the finest granularity GS1
 * publishes: the GTIN-8 pool splits 962 between GS1 UK, GS1 Poland and the
 * Global Office, and 9790 carves ISMN out of the ISBN range. A three-digit
 * table would silently mis-attribute both.
 *
 * Checked against Wikipedia's list rather than gs1.org, which answers 403 to
 * automated requests. Wikipedia tracks the official table closely but is not
 * the source of record, so 623 is the one entry worth re-checking by hand: it
 * reads as reserved there, while older lists call it Brunei.
 */

export type SpecialKey =
  | 'restrictedDistribution'
  | 'coupon'
  | 'issn'
  | 'isbn'
  | 'ismn'
  | 'refundReceipt'
  | 'gs1GlobalOffice'
  | 'epcGid'
  | 'demo'
  | 'reserved';

export type PrefixRange = { from: number; to: number } & (
  | { kind: 'country'; iso: string }
  /** A member organisation covering more than one country, so no single flag or name fits. */
  | { kind: 'region'; isos: readonly string[] }
  | { kind: 'special'; key: SpecialKey }
);

function toBounds(bounds: string): { from: number; to: number } {
  const dash = bounds.indexOf('-');
  const first = dash === -1 ? bounds : bounds.slice(0, dash);
  const last = dash === -1 ? bounds : bounds.slice(dash + 1);
  return {
    from: Number(first.padEnd(4, '0')),
    to: Number(last.padEnd(4, '9')),
  };
}

const COUNTRIES: ReadonlyArray<readonly [bounds: string, iso: string]> = [
  ['001-019', 'US'],
  ['030-039', 'US'],
  ['060-139', 'US'],
  ['380', 'BG'],
  ['381', 'XK'],
  ['383', 'SI'],
  ['385', 'HR'],
  ['387', 'BA'],
  ['389', 'ME'],
  ['400-440', 'DE'],
  ['450-459', 'JP'],
  ['460-469', 'RU'],
  ['470', 'KG'],
  ['471', 'TW'],
  ['474', 'EE'],
  ['475', 'LV'],
  ['476', 'AZ'],
  ['477', 'LT'],
  ['478', 'UZ'],
  ['479', 'LK'],
  ['480', 'PH'],
  ['481', 'BY'],
  ['482', 'UA'],
  ['483', 'TM'],
  ['484', 'MD'],
  ['485', 'AM'],
  ['486', 'GE'],
  ['487', 'KZ'],
  ['488', 'TJ'],
  ['489', 'HK'],
  ['490-499', 'JP'],
  ['500-509', 'GB'],
  ['520-521', 'GR'],
  ['528', 'LB'],
  ['529', 'CY'],
  ['530', 'AL'],
  ['531', 'MK'],
  ['535', 'MT'],
  ['539', 'IE'],
  ['560', 'PT'],
  ['569', 'IS'],
  ['590', 'PL'],
  ['594', 'RO'],
  ['599', 'HU'],
  ['600-601', 'ZA'],
  ['603', 'GH'],
  ['604', 'SN'],
  ['605', 'UG'],
  ['606', 'AO'],
  ['607', 'OM'],
  ['608', 'BH'],
  ['609', 'MU'],
  ['611', 'MA'],
  ['612', 'SO'],
  ['613', 'DZ'],
  ['615', 'NG'],
  ['616', 'KE'],
  ['617', 'CM'],
  ['618', 'CI'],
  ['619', 'TN'],
  ['620', 'TZ'],
  ['621', 'SY'],
  ['622', 'EG'],
  ['624', 'LY'],
  ['625', 'JO'],
  ['626', 'IR'],
  ['627', 'KW'],
  ['628', 'SA'],
  ['629', 'AE'],
  ['630', 'QA'],
  ['631', 'NA'],
  ['632', 'RW'],
  ['640-649', 'FI'],
  ['680-681', 'CN'],
  ['690-699', 'CN'],
  ['700-709', 'NO'],
  ['729', 'IL'],
  ['730-739', 'SE'],
  ['740', 'GT'],
  ['741', 'SV'],
  ['742', 'HN'],
  ['743', 'NI'],
  ['744', 'CR'],
  ['745', 'PA'],
  ['746', 'DO'],
  ['750', 'MX'],
  ['754-755', 'CA'],
  ['759', 'VE'],
  ['770-771', 'CO'],
  ['773', 'UY'],
  ['775', 'PE'],
  ['777', 'BO'],
  ['778-779', 'AR'],
  ['780', 'CL'],
  ['784', 'PY'],
  ['786', 'EC'],
  ['789-790', 'BR'],
  ['850', 'CU'],
  ['858', 'SK'],
  ['859', 'CZ'],
  ['860', 'RS'],
  ['865', 'MN'],
  ['867', 'KP'],
  ['868-869', 'TR'],
  ['870-879', 'NL'],
  ['880-881', 'KR'],
  ['883', 'MM'],
  ['884', 'KH'],
  ['885', 'TH'],
  ['887', 'LA'],
  ['888', 'SG'],
  ['890', 'IN'],
  ['893', 'VN'],
  ['894', 'BD'],
  ['896', 'PK'],
  ['899', 'ID'],
  ['900-919', 'AT'],
  ['930-939', 'AU'],
  ['940-949', 'NZ'],
  ['955', 'MY'],
  ['958', 'MO'],
  // GTIN-8 allocations, which is why these two are four digits wide.
  ['9600-9624', 'GB'],
  ['9625-9626', 'PL'],
];

const REGIONS: ReadonlyArray<
  readonly [bounds: string, isos: readonly string[]]
> = [
  ['300-379', ['FR', 'MC']],
  ['540-549', ['BE', 'LU']],
  ['570-579', ['DK', 'FO', 'GL']],
  ['760-769', ['CH', 'LI']],
  ['800-839', ['IT', 'SM', 'VA']],
  ['840-849', ['ES', 'AD']],
];

const SPECIALS: ReadonlyArray<readonly [bounds: string, key: SpecialKey]> = [
  ['020-029', 'restrictedDistribution'],
  ['040-049', 'restrictedDistribution'],
  ['050-059', 'reserved'],
  ['200-299', 'restrictedDistribution'],
  ['623', 'reserved'],
  ['950', 'gs1GlobalOffice'],
  ['951', 'epcGid'],
  ['952', 'demo'],
  ['9627-9699', 'gs1GlobalOffice'],
  ['977', 'issn'],
  ['978', 'isbn'],
  ['9790', 'ismn'],
  ['9791-9799', 'isbn'],
  ['980', 'refundReceipt'],
  ['981-983', 'coupon'],
  ['990-999', 'coupon'],
];

/**
 * Sorted by lower bound, which the lookup depends on. Sorting here rather than
 * trusting the authoring order keeps the three lists above readable as tables.
 * Everything they do not cover is unassigned, and stays that way by omission
 * instead of a hand-maintained list of gaps that could drift out of step.
 */
export const GS1_PREFIX_RANGES: readonly PrefixRange[] = [
  ...COUNTRIES.map(([bounds, iso]) => ({
    ...toBounds(bounds),
    kind: 'country' as const,
    iso,
  })),
  ...REGIONS.map(([bounds, isos]) => ({
    ...toBounds(bounds),
    kind: 'region' as const,
    isos,
  })),
  ...SPECIALS.map(([bounds, key]) => ({
    ...toBounds(bounds),
    kind: 'special' as const,
    key,
  })),
].sort((a, b) => a.from - b.from);
