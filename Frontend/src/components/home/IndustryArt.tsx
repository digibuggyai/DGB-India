// Generated line-art backgrounds for the "Who We Serve" flip cards, matching
// the design mockup's abstract per-industry visuals (radial burst, network
// graph, candlestick chart, film strip). Used when the CMS has no real
// `heroImage` set for that industry yet — swap this out per-slug once real
// photography/renders are uploaded to the CMS.

const GRID = (
  <pattern id="ia-grid" width="24" height="24" patternUnits="userSpaceOnUse">
    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#ffffff14" strokeWidth="1" />
  </pattern>
);

function Base({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 300 460"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>{GRID}</defs>
      <rect width="300" height="460" fill="#2e3236" />
      <rect width="300" height="460" fill="url(#ia-grid)" />
      {children}
    </svg>
  );
}

/** VFX & Animation — a red/white radial burst around a ringed center. */
function VfxArt() {
  const rays = Array.from({ length: 64 }, (_, i) => {
    const angle = (i / 64) * Math.PI * 2;
    const len = 60 + ((i * 37) % 90);
    const cx = 150,
      cy = 230;
    const r1 = 44 + ((i * 13) % 20);
    const x1 = cx + Math.cos(angle) * r1;
    const y1 = cy + Math.sin(angle) * r1;
    const x2 = cx + Math.cos(angle) * (r1 + len);
    const y2 = cy + Math.sin(angle) * (r1 + len);
    const red = i % 5 === 0;
    return (
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={red ? "#c9505f" : "#ffffff3d"}
        strokeWidth={red ? 1.4 : 1}
      />
    );
  });
  return (
    <Base>
      {rays}
      <circle cx="150" cy="230" r="60" fill="none" stroke="#c9505f" strokeWidth="1.5" />
    </Base>
  );
}

/** AI & Machine Learning — a node/edge network graph with a highlighted path. */
function AiArt() {
  const cols = 3;
  const rows = 7;
  const nodes: { id: string; x: number; y: number }[] = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      nodes.push({ id: `${c}-${r}`, x: 70 + c * 80, y: 60 + r * 48 });
    }
  }
  const find = (id: string) => nodes.find((n) => n.id === id)!;
  const greyEdges: [string, string][] = [
    ["0-0", "1-0"],
    ["1-0", "2-0"],
    ["0-1", "1-1"],
    ["1-1", "2-1"],
    ["0-2", "1-2"],
    ["1-2", "2-2"],
    ["0-3", "1-3"],
    ["1-3", "2-3"],
    ["0-4", "1-4"],
    ["1-4", "2-4"],
    ["0-5", "1-5"],
    ["1-5", "2-5"],
    ["0-6", "1-6"],
    ["1-6", "2-6"],
  ];
  const redEdges: [string, string][] = [
    ["0-1", "1-0"],
    ["0-1", "0-4"],
    ["0-4", "1-2"],
    ["0-4", "1-5"],
    ["1-2", "2-4"],
  ];
  const redNodes = new Set(["0-1", "0-4", "1-2", "2-4"]);
  return (
    <Base>
      {greyEdges.map(([a, b], i) => {
        const n1 = find(a),
          n2 = find(b);
        return <line key={`g${i}`} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke="#ffffff2e" strokeWidth="1" />;
      })}
      {redEdges.map(([a, b], i) => {
        const n1 = find(a),
          n2 = find(b);
        return <line key={`r${i}`} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke="#c9505f" strokeWidth="1.4" />;
      })}
      {nodes.map((n) => (
        <circle key={n.id} cx={n.x} cy={n.y} r={redNodes.has(n.id) ? 5 : 3} fill={redNodes.has(n.id) ? "#c9505f" : "#ffffff8a"} />
      ))}
    </Base>
  );
}

/** Trading & Finance — a candlestick chart with an upward-trending close line. */
function TradingArt() {
  const bars = Array.from({ length: 22 }, (_, i) => {
    const x = 24 + i * 12;
    const trend = 340 - i * 8 + Math.sin(i * 1.3) * 26;
    const bodyH = 18 + ((i * 17) % 22);
    const wickH = bodyH + 20;
    const up = i % 3 !== 0;
    return (
      <g key={i}>
        <line x1={x} y1={trend - wickH / 2} x2={x} y2={trend + wickH / 2} stroke={up ? "#ffffff55" : "#c9505f"} strokeWidth="1.2" />
        <rect
          x={x - 3}
          y={trend - bodyH / 2}
          width="6"
          height={bodyH}
          fill={up ? "#ffffff33" : "#8a2a35"}
        />
      </g>
    );
  });
  const points = Array.from({ length: 22 }, (_, i) => {
    const x = 24 + i * 12;
    const y = 340 - i * 8 + Math.sin(i * 1.3) * 26;
    return `${x},${y}`;
  }).join(" ");
  return (
    <Base>
      {bars}
      <polyline points={points} fill="none" stroke="#c9505f" strokeWidth="1.6" strokeLinejoin="round" />
    </Base>
  );
}

/** Media & Production — a film strip with one highlighted frame and a waveform. */
function MediaArt() {
  const frameCount = 6;
  const stripX = 60,
    stripW = 180,
    stripY = 60,
    frameH = 52,
    gap = 4;
  const frames = Array.from({ length: frameCount }, (_, i) => {
    const y = stripY + i * (frameH + gap);
    const highlighted = i === 2;
    return (
      <rect
        key={i}
        x={stripX + 18}
        y={y}
        width={stripW - 36}
        height={frameH}
        fill={highlighted ? "#8a2a35" : "#ffffff0f"}
        stroke="#ffffff33"
        strokeWidth="1"
      />
    );
  });
  const sprockets: React.ReactNode[] = [];
  const sprocketRows = Math.floor((frameCount * (frameH + gap)) / 22);
  for (let i = 0; i < sprocketRows; i++) {
    const y = stripY + 6 + i * 22;
    sprockets.push(
      <rect key={`l${i}`} x={stripX} y={y} width="10" height="12" fill="#ffffff26" />,
      <rect key={`r${i}`} x={stripX + stripW - 10} y={y} width="10" height="12" fill="#ffffff26" />,
    );
  }
  const wave = Array.from({ length: 30 }, (_, i) => {
    const x = 20 + i * 9;
    const y = 400 + Math.sin(i * 0.9) * 10;
    return `${x},${y}`;
  }).join(" ");
  return (
    <Base>
      <rect x={stripX} y={stripY} width={stripW} height={frameCount * (frameH + gap)} fill="#00000030" stroke="#ffffff26" />
      {frames}
      {sprockets}
      <polyline points={wave} fill="none" stroke="#c9505f" strokeWidth="1.4" />
    </Base>
  );
}

const ART: Record<string, () => React.ReactNode> = {
  "vfx-animation": VfxArt,
  "ai-machine-learning": AiArt,
  "trading-finance": TradingArt,
  "media-production": MediaArt,
};

/** Renders the matching abstract art for a given industry slug, or null if
 *  that industry doesn't have a generated treatment (e.g. Architecture &
 *  Engineering, which uses a plain dark panel in the source design). */
export function IndustryArt({ slug }: { slug: string }) {
  const Art = ART[slug];
  if (!Art) return null;
  return <Art />;
}
