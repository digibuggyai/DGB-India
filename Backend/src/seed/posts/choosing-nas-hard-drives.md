---
title: Choosing hard drives for a NAS: size, cost per terabyte and drive lines
slug: choosing-nas-hard-drives
type: blog
tags: Hard drives, NAS, Storage planning
excerpt: The drives usually cost more than the NAS itself. Here's how to choose them — why bigger drives are cheaper per terabyte, why every drive in an array should match, and what separates the drive lines.
---

In most NAS systems the drives cost more than the unit itself. Four 16 TB drives cost more than three times the price of the 4-bay unit they go in. So choosing them well matters more than almost anything else in the purchase.

## Bigger drives are cheaper per terabyte

On our current price list, drive cost per terabyte falls steeply with size:

- 2 TB drives: about ₹9,500–10,500 per TB
- 4 TB drives: about ₹5,500–6,750 per TB
- 10 TB to 24 TB drives: about ₹4,800–5,700 per TB

A 2 TB drive costs roughly twice as much per terabyte as a 10 TB one. Below about 10 TB you're paying mostly for the drive itself, not its capacity.

Larger drives also mean fewer of them for the same space — so a smaller, cheaper NAS unit, lower power draw, and free bays for later. For most offices, drives between 10 TB and 20 TB are the sweet spot.

The trade-off comes at the very top. The bigger the drive, the longer it takes to rebuild the array when one fails. With drives of 16 TB and above, consider RAID 6 over RAID 5 (see our [guide to RAID levels](/resources/blog/raid-levels-usable-capacity)).

## Every drive in an array should match

A standard RAID array treats every drive as if it were the size of the smallest one. Put one 8 TB drive in an array of 16 TB drives, and each 16 TB drive is used as if it held only 8 TB.

So buy drives in matching sets, of the same size and ideally the same model. Synology's SHR can make use of mixed sizes, but for a new system, matching drives is simpler and gives the full capacity you paid for.

## The drive lines we stock

We stock three lines of drives designed for systems that run around the clock:

- **Seagate IronWolf** — Seagate's line built for NAS units. On our list: 2, 4 and 10 TB.
- **Seagate Exos** — Seagate's enterprise line, built for servers and data centres. On our list: 2 TB to 20 TB.
- **WD Ultrastar** — Western Digital's enterprise line. On our list: 6 TB to 24 TB, including our largest drives.

All three are designed for continuous use in multi-drive systems, unlike desktop drives. Don't put desktop drives in a NAS: they're not built for the vibration of neighbouring drives or for running around the clock.

At the larger sizes, the enterprise lines are also the best value on our list. The 18 TB, 20 TB and 24 TB WD Ultrastar drives are our lowest cost per terabyte, at under ₹4,900 per TB.

## Check your NAS supports the drive

Two things to check before you buy drives for a particular NAS:

- **Maximum drive size.** Synology's current models support drives up to 24 TB. QNAP's support up to 32 TB.
- **Drive compatibility.** Synology's 2025 Plus models favour Synology-branded drives. Third-party drives can be used since DSM 7.3, but check the compatibility list first.

Our [NAS configurator](/nas-config) only offers drives each unit actually supports, and works out the drive size and count that give you the best value. Or [ask us](/request-a-solution) which drives suit your workload.
