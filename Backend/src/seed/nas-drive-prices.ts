/* The hard drive price list for the NAS configurator, from the sales price
 * sheet (October 2026). One place, read by both the first-run seed and the
 * price update script, so a fresh database and a live one can't disagree.
 *
 * [capacity TB, drive line, quote price, with-tax minimum] — both GST-inclusive
 * and per drive. A size/line the sheet prices at 0 isn't sold and isn't listed
 * here (22 TB has no price in any line, and each line is stocked only at the
 * capacities below). */
export const DRIVES: [number, string, number, number][] = [
  [2, "Exos", 22050, 21000],
  [2, "IronWolf", 18957, 18054],
  [4, "Exos", 27506, 26196],
  [4, "IronWolf", 22054, 21004],
  [6, "WD Ultrastar", 29736, 28320],
  [8, "Exos", 45040, 42895],
  [8, "IronWolf Pro", 48321, 46020],
  [10, "Exos", 52038, 49560],
  [10, "IronWolf", 50180, 47790],
  [10, "IronWolf Pro", 55136, 52510],
  [10, "WD Ultrastar", 50715, 48300],
  [12, "Exos", 68145, 64900],
  [12, "IronWolf Pro", 67526, 64310],
  [12, "WD Ultrastar", 67526, 64310],
  [16, "Exos", 84000, 80000],
  [16, "IronWolf Pro", 89828, 85550],
  [16, "WD Ultrastar", 86111, 82010],
  [18, "WD Ultrastar", 89208, 84960],
  [20, "Exos", 102837, 97940],
  [20, "IronWolf Pro", 106554, 101480],
  [20, "WD Ultrastar", 106554, 101480],
  [24, "WD Ultrastar", 121422, 115640],
];
