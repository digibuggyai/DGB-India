"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const TRUST_ITEMS = [
  "Architecture & Engineering",
  "VFX & Animation",
  "AI & Machine Learning",
  "Trading & Finance",
  "Media & Production",
];

type Pt = { x: number; y: number; z: number; j: number };

function makePoints(n: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const u = Math.random() * 2 - 1;
    const t = Math.random() * Math.PI * 2;
    const r = Math.pow(Math.random(), 0.35);
    const s = Math.sqrt(1 - u * u);
    pts.push({ x: s * Math.cos(t) * r, y: u * r, z: s * Math.sin(t) * r, j: 0.4 + Math.random() * 0.6 });
  }
  return pts;
}

function SphereCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const N = 1600;
    const pts = makePoints(N);

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

    let a = 0;
    let raf = 0;
    let cancelled = false;

    const draw = () => {
      if (cancelled) return;
      a += 0.0016;
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.5;
      const cy = h * 0.52;
      const R = Math.min(w * 0.28, h * 0.62);
      const sinA = Math.sin(a);
      const cosA = Math.cos(a);
      const tilt = 0.28;
      const sinT = Math.sin(tilt);
      const cosT = Math.cos(tilt);

      for (let i = 0; i < N; i++) {
        const p = pts[i];
        const x = p.x * cosA - p.z * sinA;
        let z = p.x * sinA + p.z * cosA;
        const y = p.y * cosT - z * sinT;
        z = p.y * sinT + z * cosT;
        const persp = 1 / (1.9 - z * 0.55);
        const sx = cx + x * R * persp * 1.9;
        const sy = cy + y * R * persp * 1.9;
        const depth = (z + 1) / 2;
        const alpha = (0.12 + depth * 0.78) * p.j;
        const size = 0.7 + depth * 1.3;
        ctx.fillStyle =
          i % 9 === 0
            ? `rgba(232, 249, 253, ${alpha.toFixed(3)})`
            : `rgba(128, 32, 44, ${alpha.toFixed(3)})`;
        ctx.fillRect(sx, sy, size, size);
      }
      raf = requestAnimationFrame(draw);
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

        {canAnimate && <SphereCanvas />}

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
            <span
              key={item}
              className="text-[17px] font-medium tracking-wide text-[#5c4448]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
