// Generated line-icon art for the infrastructure marquee cards, matching the
// design mockup's simple outline-icon style (rack/disk/network diagrams).
// Used when the CMS has no real `heroImage` set for that item yet.

const stroke = "#2e3236";
const accent = "#80202c";

function Icon({ children, size = 84 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      {children}
    </svg>
  );
}

/** DGX — a rack with four crossed connections to corner nodes. */
function DgxIcon({ size }: { size?: number }) {
  return (
    <Icon size={size}>
      <rect x="30" y="18" width="40" height="64" fill="none" stroke={stroke} strokeWidth="2" />
      <rect x="30" y="18" width="40" height="16" fill="none" stroke={accent} strokeWidth="2" />
      <circle cx="63" cy="26" r="2" fill={accent} />
      <circle cx="63" cy="50" r="1.6" fill={stroke} />
      <circle cx="63" cy="66" r="1.6" fill={stroke} />
      {[
        [12, 10],
        [88, 10],
        [12, 90],
        [88, 90],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 9} y={y - 6} width="18" height="12" fill="none" stroke={stroke} strokeWidth="1.5" />
          <line x1={x} y1={y} x2={i < 2 ? 70 : 30} y2={i < 2 ? 26 : 74} stroke={stroke} strokeWidth="1" />
        </g>
      ))}
    </Icon>
  );
}

/** Workstations — a monitor beside a document/spec sheet. */
function WorkstationIcon({ size }: { size?: number }) {
  return (
    <Icon size={size}>
      <rect x="14" y="34" width="30" height="24" fill="none" stroke={accent} strokeWidth="2" />
      <line x1="29" y1="58" x2="29" y2="66" stroke={accent} strokeWidth="2" />
      <line x1="18" y1="66" x2="40" y2="66" stroke={accent} strokeWidth="2" />
      <rect x="52" y="16" width="34" height="68" fill="none" stroke={stroke} strokeWidth="2" />
      {[26, 38, 50, 62, 74].map((y, i) => (
        <line key={i} x1="59" y1={y} x2="79" y2={y} stroke={stroke} strokeWidth="1.4" />
      ))}
    </Icon>
  );
}

/** NAS — a stack of disks with the top ring highlighted. */
function NasIcon({ size }: { size?: number }) {
  return (
    <Icon size={size}>
      {[24, 40, 56, 72].map((y, i) => (
        <ellipse
          key={i}
          cx="50"
          cy={y}
          rx="28"
          ry="9"
          fill="none"
          stroke={i === 0 ? accent : stroke}
          strokeWidth={i === 0 ? 2 : 1.5}
        />
      ))}
      <ellipse cx="50" cy="24" rx="10" ry="4" fill="none" stroke={accent} strokeWidth="1.6" />
    </Icon>
  );
}

/** Servers — a rack of unit bays, each with a status dot (some highlighted). */
function ServerIcon({ size }: { size?: number }) {
  const rows = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <Icon size={size}>
      <rect x="24" y="10" width="52" height="80" fill="none" stroke={stroke} strokeWidth="2" />
      {rows.map((r) => {
        const y = 20 + r * 9;
        const on = r === 1 || r === 4;
        return (
          <g key={r}>
            <rect x="30" y={y} width="30" height="5.5" fill="none" stroke={stroke} strokeWidth="1" />
            <circle cx="66" cy={y + 2.75} r="1.6" fill={on ? accent : stroke} />
          </g>
        );
      })}
    </Icon>
  );
}

/** Storage — three unit bays, each with an accent-highlighted second slot. */
function StorageIcon({ size }: { size?: number }) {
  const rows = [0, 1, 2];
  return (
    <Icon size={size}>
      <line x1="16" y1="16" x2="84" y2="16" stroke={accent} strokeWidth="2" />
      {rows.map((r) => {
        const y = 26 + r * 22;
        return (
          <rect key={r} x="16" y={y} width="68" height="16" fill="none" stroke={stroke} strokeWidth="1.6">
            <title>{r}</title>
          </rect>
        );
      })}
      {rows.map((r) => {
        const y = 26 + r * 22;
        return (
          <g key={`cells-${r}`}>
            {[0, 1, 2, 3].map((c) => (
              <rect
                key={c}
                x={20 + c * 16}
                y={y + 3}
                width="12"
                height="10"
                fill="none"
                stroke={c === 1 ? accent : "#9aa0a6"}
                strokeWidth="1.2"
              />
            ))}
          </g>
        );
      })}
    </Icon>
  );
}

/** Networking — nodes on an octagon, connected to a central switch. */
function NetworkingIcon({ size }: { size?: number }) {
  const n = 8;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + Math.cos(a) * 34, y: 50 + Math.sin(a) * 34, red: i === 1 || i === 2 || i === 5 };
  });
  return (
    <Icon size={size}>
      <rect x="43" y="43" width="14" height="14" fill="none" stroke={stroke} strokeWidth="2" />
      {pts.map((p, i) => {
        const next = pts[(i + 1) % n];
        return <line key={`e${i}`} x1={p.x} y1={p.y} x2={next.x} y2={next.y} stroke={p.red && next.red ? accent : "#9aa0a6"} strokeWidth="1.2" />;
      })}
      {pts.map((p, i) => (
        <line key={`s${i}`} x1="50" y1="50" x2={p.x} y2={p.y} stroke={p.red ? accent : "#c7ccd1"} strokeWidth="1" />
      ))}
      {pts.map((p, i) => (
        <circle key={`n${i}`} cx={p.x} cy={p.y} r="3.2" fill={p.red ? accent : stroke} />
      ))}
    </Icon>
  );
}

/** Backup — a shield above a protected disk stack. */
function BackupIcon({ size }: { size?: number }) {
  return (
    <Icon size={size}>
      {[62, 72, 82].map((y, i) => (
        <ellipse key={i} cx="50" cy={y} rx="24" ry="7" fill="none" stroke={stroke} strokeWidth="1.5" />
      ))}
      <path d="M50 14 L72 22 V40 C72 54 62 62 50 66 C38 62 28 54 28 40 V22 Z" fill="none" stroke={accent} strokeWidth="2" />
      <path d="M40 40 L47 47 L61 32" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Icon>
  );
}

const ICON: Record<string, (props: { size?: number }) => React.ReactNode> = {
  DGX: DgxIcon,
  Workstations: WorkstationIcon,
  NAS: NasIcon,
  Servers: ServerIcon,
  Storage: StorageIcon,
  Networking: NetworkingIcon,
  Backup: BackupIcon,
};

/** Renders the matching outline icon for a given infrastructure item name. */
export function InfraIcon({ name, size }: { name: string; size?: number }) {
  const IconCmp = ICON[name];
  if (!IconCmp) return null;
  return <div className="flex h-full w-full items-center justify-center">{IconCmp({ size })}</div>;
}
