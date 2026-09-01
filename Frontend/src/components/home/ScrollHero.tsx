"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const LEFT_FEATURES = [
  { title: "Workload-Driven", desc: "Every recommendation starts with what you run, not a parts catalog." },
  { title: "GPU-Optimized Compute", desc: "Servers and workstations sized to VRAM, not just core count." },
  { title: "Engineered Integration", desc: "Validated, configured and benchmarked before it ships." },
];

const RIGHT_FEATURES = [
  { title: "High-Throughput Storage", desc: "NVMe and NAS sized to your actual data pipeline." },
  { title: "Low-Latency Networking", desc: "The fabric that keeps compute and storage from bottlenecking." },
  { title: "Support That Scales", desc: "Monitored and maintained as your workload grows." },
];

const HOW_STEPS = [
  { n: "01", title: "Understand", desc: "We map your workload's real requirements." },
  { n: "02", title: "Design", desc: "Compute, storage and networking sized to fit." },
  { n: "03", title: "Deploy & Support", desc: "Installed, validated and supported as you scale." },
];

const TOP_BY_INDEX = ["22%", "44%", "66%"];

export function ScrollHero() {
  // The stage/canvas/layers markup is always the same DOM nodes — only their
  // height/behaviour changes with `mode`, so the WebGL context and refs
  // never get torn down mid-setup by a conditional remount.
  const [mode, setMode] = useState<"simple" | "full">("simple");

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const meetRef = useRef<HTMLDivElement>(null);
  const howRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = window.innerWidth < 900;
    if (reducedMotion || isSmall) return; // stay in "simple" mode

    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      try {
      const [THREE, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("three"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled || !canvasRef.current || !stageRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      const canvas = canvasRef.current;
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.z = 6;

      const COUNT = 2200;
      const spherePositions = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = 1.7 * (0.88 + Math.random() * 0.22);
        spherePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        spherePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        spherePositions[i * 3 + 2] = r * Math.cos(phi);
      }

      // Target shape: an ordered rack grid — the "resolved infrastructure"
      // the chaotic workload sphere settles into.
      const cols = 48;
      const rows = Math.ceil(COUNT / cols);
      const gridPositions = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);
        gridPositions[i * 3] = (c / cols - 0.5) * 7.2;
        gridPositions[i * 3 + 1] = (r / rows - 0.5) * 3.2;
        gridPositions[i * 3 + 2] = 0;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(spherePositions.slice(), 3));

      const material = new THREE.PointsMaterial({
        color: 0x80202c,
        size: 0.022,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      });
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      const onResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
      };
      window.addEventListener("resize", onResize);

      let raf = 0;
      const animate = () => {
        raf = requestAnimationFrame(animate);
        points.rotation.y += 0.0009;
        points.rotation.x += 0.0002;
        renderer.render(scene, camera);
      };
      animate();

      setMode("full");
      let tl: ReturnType<typeof gsap.timeline> | null = null;

      // Let the DOM apply the 380vh stage height before ScrollTrigger measures it.
      requestAnimationFrame(() => {
        if (cancelled) return;
        ScrollTrigger.refresh();

        tl = gsap.timeline({
          scrollTrigger: {
            trigger: stageRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            pin: canvas.parentElement,
          },
        });

        // Hero is visible by default (plain opacity-1 markup); the scroll
        // timeline only ever fades it away as the story continues. Every
        // tween below uses an explicit absolute start time (0–1) rather than
        // chained "+=" offsets — much easier to reason about and debug than
        // relative chaining, where one wrong duration shifts everything after it.
        tl.to(heroRef.current, { opacity: 0, y: -20, duration: 0.06 }, 0)
          .to(meetRef.current?.querySelector(".meet-heading") ?? {}, { opacity: 1, duration: 0.05 }, 0.1)
          .to(".feat-left-0, .feat-right-0", { opacity: 1, duration: 0.05 }, 0.16)
          .to(".feat-left-1, .feat-right-1", { opacity: 1, duration: 0.05 }, 0.23)
          .to(".feat-left-2, .feat-right-2", { opacity: 1, duration: 0.05 }, 0.3)
          .to(meetRef.current, { opacity: 0, duration: 0.06 }, 0.55)
          .to(howRef.current, { opacity: 1, duration: 0.06 }, 0.55)
          .to(points.position, { x: 1.7, duration: 0.08 }, 0.55)
          .to(points.scale, { x: 0.55, y: 0.55, z: 0.55, duration: 0.08 }, 0.55)
          .to(
            { t: 0 },
            {
              t: 1,
              duration: 0.2,
              onUpdate: function () {
                const t = this.targets()[0].t;
                const pos = geometry.attributes.position.array as Float32Array;
                for (let i = 0; i < COUNT; i++) {
                  pos[i * 3] = THREE.MathUtils.lerp(spherePositions[i * 3], gridPositions[i * 3], t);
                  pos[i * 3 + 1] = THREE.MathUtils.lerp(spherePositions[i * 3 + 1], gridPositions[i * 3 + 1], t);
                  pos[i * 3 + 2] = THREE.MathUtils.lerp(spherePositions[i * 3 + 2], gridPositions[i * 3 + 2], t);
                }
                geometry.attributes.position.needsUpdate = true;
              },
            },
            0.68,
          )
          .to(howRef.current, { opacity: 0, duration: 0.08 }, 0.9)
          .to(material, { opacity: 0, duration: 0.08 }, 0.9);
      });

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        tl?.scrollTrigger?.kill();
        tl?.kill();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
      } catch (err) {
        console.error("ScrollHero: falling back to simple mode —", err);
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  const isFull = mode === "full";

  return (
    <div
      ref={stageRef}
      data-scroll-stage
      data-mode={mode}
      className="relative border-b border-ink-900"
      style={{ height: isFull ? "380vh" : undefined }}
    >
      <div className="sticky top-0 flex h-screen w-full flex-col justify-center overflow-hidden bg-ink-800">
        {!isFull && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(to right, #43484d 1px, transparent 1px), linear-gradient(to bottom, #43484d 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
            }}
          />
        )}

        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        <div
          ref={heroRef}
          className="pointer-events-none relative flex flex-col items-center text-center"
        >
          <div className="pointer-events-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#43484d] bg-ink-900/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-ink-muted backdrop-blur">
              Enterprise Infrastructure Partner
            </span>
            <h1 className="font-display mt-8 px-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span className="text-gradient">Your Workload.</span>
              <br />
              <span className="text-white">Our Infrastructure.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl px-4 text-balance text-lg text-ink-muted-2">
              We understand your workload first, then design the infrastructure around it.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/infrastructure"
                className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
              >
                Explore Infrastructure
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white"
              >
                Talk to an Expert
              </Link>
            </div>
          </div>
        </div>

        <div ref={meetRef} className="pointer-events-none absolute inset-0">
          <div className="meet-heading absolute bottom-[13%] left-1/2 w-full -translate-x-1/2 px-4 text-center opacity-0">
            <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">We Design the Infrastructure.</h2>
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-ink-muted">
              Workload-aware. Purpose-built.
            </p>
          </div>

          {LEFT_FEATURES.map((f, i) => (
            <FeatureNode key={f.title} side="left" index={i} title={f.title} desc={f.desc} />
          ))}
          {RIGHT_FEATURES.map((f, i) => (
            <FeatureNode key={f.title} side="right" index={i} title={f.title} desc={f.desc} />
          ))}
        </div>

        <div ref={howRef} className="pointer-events-none absolute inset-0 flex items-center opacity-0">
          <div className="container-page">
            <div className="max-w-md">
              <div className="text-xs font-semibold uppercase tracking-widest text-white/70">How We Work</div>
              <h3 className="font-display mt-3 text-2xl font-semibold leading-tight text-white sm:text-3xl">
                From complex workload to ordered infrastructure.
              </h3>
              <div className="mt-8 space-y-5">
                {HOW_STEPS.map((step) => (
                  <div key={step.n} className="flex gap-4 border-t border-[#43484d] pt-5">
                    <span className="font-display text-sm text-ink-muted">{step.n}</span>
                    <div>
                      <div className="font-medium text-white">{step.title}</div>
                      <p className="mt-1 text-sm text-ink-muted-2">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureNode({
  side,
  index,
  title,
  desc,
}: {
  side: "left" | "right";
  index: number;
  title: string;
  desc: string;
}) {
  const isLeft = side === "left";
  return (
    <div
      className={`feat-${side}-${index} absolute w-56 px-4 opacity-0 sm:w-64 ${isLeft ? "left-0 text-right sm:left-[4%]" : "right-0 text-left sm:right-[4%]"}`}
      style={{ top: TOP_BY_INDEX[index] }}
    >
      <div
        className={`absolute top-2 hidden h-px w-14 bg-[#43484d] sm:block ${isLeft ? "-right-14" : "-left-14"}`}
      />
      <div className="font-display text-sm font-medium text-white">{title}</div>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted-2">{desc}</p>
    </div>
  );
}
