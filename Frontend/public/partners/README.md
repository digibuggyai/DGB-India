# Partner logos

Drop brand logo files here to have them appear in the homepage partner strip
(`src/components/home/Partners.tsx`).

**Filename must match the brand's slug**, with any of these extensions:
`.svg` (best), `.png`, `.webp`, `.jpg`.

| Brand     | Filename        | Brand    | Filename       |
| --------- | --------------- | -------- | -------------- |
| MSI       | `msi.svg`       | Samsung  | `samsung.svg`  |
| NVIDIA    | `nvidia.svg`    | BenQ     | `benq.svg`     |
| PNY       | `pny.svg`       | Dell     | `dell.svg`     |
| ASUS      | `asus.svg`      | Seagate  | `seagate.svg`  |
| ASRock    | `asrock.svg`    | WD       | `wd.svg`       |
| GIGABYTE  | `gigabyte.svg`  | QNAP     | `qnap.svg`     |
| ADATA     | `adata.svg`     | Synology | `synology.svg` |
| XPG       | `xpg.svg`       |          |                |
| G.SKILL   | `gskill.svg`    |          |                |
| DeepCool  | `deepcool.svg`  |          |                |

Any brand without a matching file falls back to rendering its name as a
wordmark, so the strip always looks complete.

Notes:

- Logos are displayed grayscale at ~60% opacity and go full colour on hover,
  so a plain dark-on-transparent logo works best. Avoid files with a baked-in
  white box background — they'll show as visible rectangles.
- Each logo sits in a fixed slot and is `contain`-fitted, so tall/wide logos
  are both handled; no need to pre-crop to a common size.
- To manage partners through the CMS instead, add them to the **Partners**
  collection in the admin panel (name + logo upload). If that collection has
  any entries it takes priority over this folder.
