/* The hard drive price list for the NAS configurator, from the sales price
 * sheet (September 2026). One place, read by both the first-run seed and the
 * price update script, so a fresh database and a live one can't disagree.
 *
 * [capacity TB, drive line, quote price, with-tax minimum] — both GST-inclusive
 * and per drive. A size/line the sheet prices at 0 isn't sold and isn't listed
 * here (22 TB has no price in any line, and each line is stocked only at the
 * capacities below). */
export const DRIVES: [number, string, number, number][] = [
  [2, "Exos", 21683, 20650],
  [2, "IronWolf", 18957, 18054],
  [4, "Exos", 27510, 26200],
  [4, "IronWolf", 22054, 21004],
  [6, "WD Ultrastar", 29736, 28320],
  [8, "Exos", 45224, 43070],
  [8, "IronWolf Pro", 48321, 46020],
  [10, "Exos", 52038, 49560],
  [10, "IronWolf", 49560, 47200],
  [10, "IronWolf Pro", 55136, 52510],
  [10, "WD Ultrastar", 50180, 47790],
  [12, "Exos", 68145, 64900],
  [12, "IronWolf Pro", 67526, 64310],
  [12, "WD Ultrastar", 67526, 64310],
  [16, "Exos", 83633, 79650],
  [16, "IronWolf Pro", 89828, 85550],
  [16, "WD Ultrastar", 84872, 80830],
  [18, "WD Ultrastar", 87969, 83780],
  [20, "Exos", 102837, 97940],
  [20, "IronWolf Pro", 106554, 101480],
  [20, "WD Ultrastar", 100979, 96170],
  [24, "WD Ultrastar", 118944, 113280],
];
