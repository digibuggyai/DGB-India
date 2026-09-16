/* The hard drive price list for the NAS configurator, from the sales price
 * sheet (September 2026). One place, read by both the first-run seed and the
 * price update script, so a fresh database and a live one can't disagree.
 *
 * [capacity TB, drive line, quote price, with-tax minimum] — both GST-inclusive
 * and per drive. A size/line the sheet prices at 0 isn't sold and isn't listed
 * here (22 TB has no price in either column). */
export const DRIVES: [number, string, number, number][] = [
  [2, "Exos", 21000, 20060],
  [2, "IronWolf", 19000, 18054],
  [4, "Exos", 27010.2, 25724],
  [4, "IronWolf", 22000, 21004],
  [6, "WD Ultrastar", 35000, 28320],
  [8, "Exos", 45000, 43070],
  [10, "Exos", 52000, 49560],
  [10, "IronWolf", 50000, 47200],
  [10, "WD Ultrastar", 50000, 47790],
  [12, "Exos", 68000, 64900],
  [12, "WD Ultrastar", 65000, 62540],
  [16, "Exos", 81000, 77880],
  [16, "WD Ultrastar", 82000, 79650],
  [18, "WD Ultrastar", 86110.5, 82010],
  [20, "Exos", 102000, 97940],
  [20, "WD Ultrastar", 97000, 93220],
  [24, "WD Ultrastar", 116000, 110920],
];
