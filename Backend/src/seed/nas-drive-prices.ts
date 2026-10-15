/* The hard drive price list for the NAS configurator, from the sales price
 * sheet dated 14 October 2026. One place, read by both the first-run seed and
 * the price update script, so a fresh database and a live one can't disagree.
 *
 * [capacity TB, drive line, quote price, with-tax minimum] — both GST-inclusive
 * and per drive. The minimum is the quote less the standard 5% margin, which is
 * how every row on the sheet has been priced.
 *
 * A size/line the sheet prices at 0 isn't sold and isn't listed here: each line
 * is stocked only at the capacities below. Skyhawk is on the sheet but is a
 * surveillance drive, not a NAS one, so the configurator doesn't carry it. */
export const DRIVES: [number, string, number, number][] = [
  [2, "Exos", 22302, 21240],
  [2, "IronWolf", 19824, 18880],
  [4, "Exos", 27258, 25960],
  [4, "IronWolf", 22302, 21240],
  [8, "Exos", 45843, 43660],
  [8, "IronWolf Pro", 50799, 48380],
  [10, "Exos", 53277, 50740],
  [10, "IronWolf", 50799, 48380],
  [10, "IronWolf Pro", 57614, 54870],
  [10, "WD Ultrastar", 50799, 48380],
  [12, "Exos", 70623, 67260],
  [12, "IronWolf Pro", 75579, 71980],
  [12, "WD Ultrastar", 66906, 63720],
  [16, "Exos", 89208, 84960],
  [16, "IronWolf Pro", 96642, 92040],
  [16, "WD Ultrastar", 89208, 84960],
  [18, "WD Ultrastar", 100359, 95580],
  [20, "Exos", 113988, 108560],
  [20, "IronWolf Pro", 117705, 112100],
  [20, "WD Ultrastar", 111510, 106200],
  [24, "WD Ultrastar", 136290, 129800],
  [30, "Exos", 163548, 155760],
];

/* Priced on the sheet, but loaded switched off: the figure looks like a slip
 * rather than a price, so quoting it would overcharge a customer.
 *
 * 18 TB Exos is listed at the same ₹1,63,548 as the 30 TB Exos — ₹9,086 per TB,
 * where every other drive on the sheet falls between ₹5,000 and ₹6,800, and
 * where the larger 20 TB Exos costs ₹49,560 less. It reads as the 30 TB figure
 * copied up a row.
 *
 * The row exists so the price is on record and the admin Pricing tab can switch
 * it on the moment the sheet is confirmed — no retyping, no second migration. */
export const HELD: [number, string, number, number][] = [[18, "Exos", 163548, 155760]];

/* Sold previously, priced 0 on the 14 October sheet: switched off rather than
 * deleted, so past quotes still resolve and the row can come back if stock
 * does. */
export const WITHDRAWN: [number, string][] = [[6, "WD Ultrastar"]];
