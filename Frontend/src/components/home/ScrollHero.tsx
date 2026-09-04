"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const TRUST_ITEMS = [
  { label: "Architecture & Engineering", slug: "architecture-engineering" },
  { label: "VFX & Animation", slug: "vfx-animation" },
  { label: "AI & Machine Learning", slug: "ai-machine-learning" },
  { label: "Trading & Finance", slug: "trading-finance" },
  { label: "Media & Production", slug: "media-production" },
];

type Block = { gx: number; gz: number; h: number; accent: boolean; phase: number; amp: number };

// Deterministic per-cell pseudo-random, so the layout is identical every load.
function hash(x: number, z: number) {
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function makeBlocks(): Block[] {
  const GRID = 9; // plate is GRID x GRID cells, corners trimmed to a circle
  const DENSITY = 0.24; // cells below this random value are left empty
  const MIN_H = 0.35; // shortest tower, in grid units
  const MAX_H = 2.85; // tallest tower
  const ACCENT_AT = 0.86; // cells above this random value render in maroon

  const blocks: Block[] = [];
  for (let gx = 0; gx < GRID; gx++) {
    for (let gz = 0; gz < GRID; gz++) {
      const cx = gx - (GRID - 1) / 2;
      const cz = gz - (GRID - 1) / 2;
      if (Math.sqrt(cx * cx + cz * cz) > GRID / 2 + 0.4) continue; // trim to a circle
      const rnd = hash(gx, gz);
      if (rnd < DENSITY) continue; // leave gaps
      blocks.push({
        gx: cx,
        gz: cz,
        h: MIN_H + rnd * (MAX_H - MIN_H),
        accent: rnd > ACCENT_AT,
        phase: rnd * Math.PI * 2, // offset so towers breathe out of sync
        amp: 0.1 + rnd * 0.22, // how far each tower rises and falls
      });
    }
  }
  return blocks;
}

function IsometricCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SPEED = reducedMotion ? 0 : 0.00085; // radians per frame (~2 min per full rotation)
    const START_ANGLE = 0.45; // initial rotation so it doesn't start axis-aligned
    const UNIT_W = 0.052; // cell size as a fraction of hero width
    const UNIT_H = 0.13; // …capped by this fraction of hero height

    const blocks = makeBlocks();

    let w = 0;
    let h = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let a = START_ANGLE;
    let raf = 0;
    let cancelled = false;

    const draw = () => {
      if (cancelled) return;
      a += SPEED;
      ctx.clearRect(0, 0, w, h);

      const ox = w * 0.5; // origin of the plate on screen
      const oy = h * 0.56;
      const U = Math.min(w * UNIT_W, h * UNIT_H); // one grid unit in px
      const sinA = Math.sin(a);
      const cosA = Math.cos(a);
      const t = a * 34; // drives the breathing

      // grid coord (gx, gz) + height y  ->  screen [x, y]
      const iso = (gx: number, gz: number, y: number): [number, number] => {
        const rx = gx * cosA - gz * sinA;
        const rz = gx * sinA + gz * cosA;
        return [ox + (rx - rz) * U * 0.94, oy + (rx + rz) * U * 0.5 - y * U * 0.78];
      };

      // painter's algorithm: farthest tower first
      const order = blocks
        .map((b) => {
          const rx = b.gx * cosA - b.gz * sinA;
          const rz = b.gx * sinA + b.gz * cosA;
          return { b, key: rx + rz };
        })
        .sort((p, q) => p.key - q.key);

      const face = (pts: [number, number][], fill: string, stroke: string) => {
        ctx.beginPath();
        pts.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1])));
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1;
        ctx.stroke();
      };

      for (const { b } of order) {
        const hgt = b.h + Math.sin(t * 0.35 + b.phase) * b.amp;
        const x0 = b.gx - 0.42;
        const x1 = b.gx + 0.42;
        const z0 = b.gz - 0.42;
        const z1 = b.gz + 0.42;
        const acc = b.accent;

        // left face (darkest)
        face(
          [iso(x0, z1, hgt), iso(x0, z1, 0), iso(x0, z0, 0), iso(x0, z0, hgt)],
          acc ? "rgba(128,32,44,0.42)" : "rgba(255,255,255,0.035)",
          acc ? "rgba(177,111,121,0.50)" : "rgba(255,255,255,0.10)",
        );

        // right face
        face(
          [iso(x0, z1, hgt), iso(x0, z1, 0), iso(x1, z1, 0), iso(x1, z1, hgt)],
          acc ? "rgba(128,32,44,0.26)" : "rgba(255,255,255,0.018)",
          acc ? "rgba(177,111,121,0.34)" : "rgba(255,255,255,0.07)",
        );

        // top face (brightest — reads as the light source)
        face(
          [iso(x0, z0, hgt), iso(x1, z0, hgt), iso(x1, z1, hgt), iso(x0, z1, hgt)],
          acc ? "rgba(177,111,121,0.30)" : "rgba(255,255,255,0.055)",
          acc ? "rgba(209,115,127,0.75)" : "rgba(255,255,255,0.20)",
        );
      }

      if (!reducedMotion) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}

export function ScrollHero() {
  const [canAnimate, setCanAnimate] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setCanAnimate(!mq.matches);
  }, []);

  return (
    <>
      <section className="relative overflow-hidden border-b border-ink-900 bg-ink-800">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff08 1px, transparent 1px), linear-gradient(to bottom, #ffffff08 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {canAnimate && <IsometricCanvas />}

        <div className="container-page relative mx-auto max-w-[1240px] py-[90px] text-center sm:py-[110px] lg:py-[130px] lg:pb-[118px]">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
            <span className="h-[3px] w-10 bg-accent" />
            Enterprise Infrastructure
          </span>
          <h1 className="font-display mx-auto mt-8 max-w-4xl text-4xl font-bold leading-[1.04] tracking-[-0.02em] sm:text-5xl lg:text-[68px]">
            <span className="text-white">Your Workload.</span>
            <br />
            <span className="text-[#eef1f3]">Our Infrastructure.</span>
          </h1>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/infrastructure"
              className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Explore Solutions
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-[#5a6066] px-7 py-3.5 text-sm font-medium text-white transition-colors hover:border-[#eef1f3] hover:bg-white/5"
            >
              Talk to an Expert
            </Link>
          </div>
        </div>
      </section>

      <div className="border-b border-[#d9bcc1] bg-[#ecdcdf]">
        <div className="container-page flex flex-wrap items-center justify-center gap-x-14 gap-y-3 py-5">
          {TRUST_ITEMS.map((item) => (
            <Link
              key={item.slug}
              href={`/industries/${item.slug}`}
              className="text-[17px] font-medium tracking-wide text-[#5c4448] transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
