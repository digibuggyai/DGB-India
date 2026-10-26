/* NAS chassis prices, from the "Pricing" sheet of the sales Catalog workbook,
 * read 26 October 2026.
 *
 * [quote price, with-tax minimum] — both GST-inclusive, per chassis.
 *
 * Unlike the drives, these minimums are not a fixed percentage of the quote:
 * the sheet sets each one by hand, and they range from about 2.5% to 8%. So
 * they are transcribed, never derived — see nas-drive-prices.ts for the
 * drives, where a uniform 5% does hold.
 *
 * The sheet also carries an unlabelled cost column and an ex-GST column. The
 * configurator quotes GST-inclusive throughout and never shows either, so
 * neither is imported. */
export const MODEL_PRICES: Record<string, [quote: number, minimum: number]> = {
  // 2-bay
  DS223J: [24000, 22420],
  "DS225+": [42000, 40120],
  "DS725+": [94000, 89680],
  "TS-233-2G": [25000, 23000],
  "TS-216G-4G": [31000, 29730],
  // 4-bay
  "DS425+": [67000, 63720],
  "DS925+": [95000, 92630],
  "TS-433-4G": [45000, 42480],
  "TS-462-4G": [57000, 54280],
  "TS-464-8G": [75000, 72080],
  // 5-bay
  "DS1525+": [138000, 132700],
  // 6-bay
  "TS-664-8G": [87000, 82600],
  // 8-bay
  "DS1825+": [175000, 170100],
  "TS-832PX-4G": [110000, 106250],
  "TS-873A-8G": [130000, 123900],
};
