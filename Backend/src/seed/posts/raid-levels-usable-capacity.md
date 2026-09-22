---
title: RAID 1, 5, 6 or 10: how much of your NAS you actually get to use
slug: raid-levels-usable-capacity
type: blog
tags: RAID, NAS, Storage planning
excerpt: A 4-bay NAS with four 8 TB drives can give you 32 TB, 24 TB or 16 TB of usable space — depending on one setting. Here's what each RAID level costs you, and what it buys.
---

When you buy four 8 TB drives, you're paying for 32 TB. How much of that you can actually store files on depends on the RAID level you choose — and the answer ranges from all of it to half of it.

RAID trades capacity for protection. Every level below except RAID 0 sets aside some of your drives' space so the NAS can keep working, and keep your data, when a drive fails. The question is how much protection your data needs, and how much capacity you're willing to give up for it.

## The same four drives, five ways

Take a 4-bay NAS with four 8 TB drives — 32 TB of raw capacity:

- **RAID 0 — 32 TB usable (100%).** Data is striped across all four drives. Fastest, and nothing is set aside. But if any one drive fails, everything on the array is lost.
- **RAID 5 — 24 TB usable (75%).** One drive's worth of space holds parity. Any single drive can fail and the NAS keeps running while you replace it.
- **RAID 6 — 16 TB usable (50%).** Two drives' worth holds parity. Any two drives can fail at once.
- **RAID 10 — 16 TB usable (50%).** Drives are paired into mirrors, and the mirrors are striped. It survives one failure per pair, and rebuilds fastest.
- **RAID 1 — 8 TB usable per pair.** Two drives hold identical copies. Simple, and common in 2-bay units.

## It changes with more drives

Parity costs a fixed number of drives, so the bigger the array, the smaller the share it takes. With eight 16 TB drives — 128 TB raw:

- RAID 5 gives **112 TB** (88%)
- RAID 6 gives **96 TB** (75%)
- RAID 10 gives **64 TB** (50%)

That's why RAID 6 makes much more sense in an 8-bay unit than in a 4-bay one: you give up the same two drives either way, but in eight bays they're a quarter of the array, not half.

## Minimum drives for each level

Every level needs a minimum number of drives before it can exist at all:

- RAID 0 and RAID 1 — two drives
- RAID 5 — three drives
- RAID 6 and RAID 10 — four drives (RAID 10 in pairs)

So a 2-bay NAS can only do RAID 0 or RAID 1, and RAID 6 needs at least a 4-bay unit.

## Which one should you choose?

For most offices, **RAID 5** is the right starting point: it survives a drive failure and keeps three-quarters or more of your capacity.

Move to **RAID 6** when the array is large — six or more drives, or drives of 16 TB and up. The bigger the drives, the longer a rebuild takes after a failure, and during a RAID 5 rebuild a second failure loses everything. RAID 6 covers that window.

Choose **RAID 10** when speed matters more than capacity — databases, virtual machines, video editing straight off the NAS.

Use **RAID 0** only for data you can afford to lose, such as scratch space or files that are backed up elsewhere.

And whichever you choose: **RAID is not a backup.** It protects you from a failed drive. It doesn't protect you from a deleted folder, ransomware or a fire. Keep a separate backup.

## Try it with real prices

Our [NAS configurator](/nas-config) works this out for you. Pick a capacity and a RAID level, and it chooses the unit, the drive size and the drive count together, priced from our current list. Or [talk to an engineer](/request-a-solution) about which level suits your data.
