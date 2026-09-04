// Generated line-icon art for the "How We Work" step cards, matching the
// site's existing outline-icon style (see InfraIcon.tsx / IndustryArt.tsx).

const stroke = "#a9b0b6";
const accent = "#80202c";

function Icon({ children, size = 40 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden>
      {children}
    </svg>
  );
}

/** Understand — a magnifier over a document, reading requirements. */
function UnderstandIcon() {
  return (
    <Icon>
      <rect x="22" y="14" width="46" height="62" fill="none" stroke={stroke} strokeWidth="2" />
      {[26, 36, 46, 56].map((y, i) => (
        <line key={i} x1="30" y1={y} x2={i === 3 ? 46 : 60} y2={y} stroke={stroke} strokeWidth="1.4" />
      ))}
      <circle cx="64" cy="66" r="16" fill="none" stroke={accent} strokeWidth="2.2" />
      <line x1="75" y1="77" x2="86" y2="88" stroke={accent} strokeWidth="2.2" strokeLinecap="round" />
    </Icon>
  );
}

/** Design — a pencil drafting a blueprint grid. */
function DesignIcon() {
  return (
    <Icon>
      <rect x="16" y="16" width="68" height="52" fill="none" stroke={stroke} strokeWidth="2" />
      <path d="M16 16 L84 16 L84 68 L16 68 Z" fill="none" />
      {[32, 48, 64].map((x, i) => (
        <line key={i} x1={x} y1="16" x2={x} y2="68" stroke={stroke} strokeWidth="1" opacity="0.5" />
      ))}
      {[30, 42, 54].map((y, i) => (
        <line key={i} x1="16" y1={y} x2="84" y2={y} stroke={stroke} strokeWidth="1" opacity="0.5" />
      ))}
      <path d="M40 60 L66 34 L74 42 L48 68 L38 70 Z" fill="none" stroke={accent} strokeWidth="2.2" strokeLinejoin="round" />
      <line x1="60" y1="40" x2="68" y2="48" stroke={accent} strokeWidth="1.6" />
    </Icon>
  );
}

/** Deploy — a rocket/upward arrow launching from a rack base. */
function DeployIcon() {
  return (
    <Icon>
      <rect x="34" y="66" width="32" height="14" fill="none" stroke={stroke} strokeWidth="2" />
      <line x1="40" y1="73" x2="60" y2="73" stroke={stroke} strokeWidth="1.2" opacity="0.6" />
      <path d="M50 12 C60 24 62 40 58 56 L42 56 C38 40 40 24 50 12 Z" fill="none" stroke={accent} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="50" cy="32" r="5" fill="none" stroke={accent} strokeWidth="1.8" />
      <path d="M42 56 L34 66 M58 56 L66 66" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M46 62 L44 74 M54 62 L56 74" stroke={accent} strokeWidth="1.6" strokeLinecap="round" />
    </Icon>
  );
}

/** Support — a shield with a wrench, ongoing protection & maintenance. */
function SupportIcon() {
  return (
    <Icon>
      <path d="M50 14 L76 24 V46 C76 62 64 72 50 78 C36 72 24 62 24 46 V24 Z" fill="none" stroke={stroke} strokeWidth="2" />
      <circle cx="50" cy="44" r="13" fill="none" stroke={accent} strokeWidth="2" />
      <path
        d="M50 33 L52 38 L57 39 L53 43 L54 48 L50 45 L46 48 L47 43 L43 39 L48 38 Z"
        fill="none"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="50" y1="57" x2="50" y2="66" stroke={stroke} strokeWidth="1.6" />
    </Icon>
  );
}

const ICON: Record<string, () => React.ReactNode> = {
  Understand: UnderstandIcon,
  Design: DesignIcon,
  Deploy: DeployIcon,
  Support: SupportIcon,
};

/** Renders the matching outline icon for a "How We Work" step title. */
export function ProcessIcon({ title }: { title: string }) {
  const IconCmp = ICON[title];
  if (!IconCmp) return null;
  return <IconCmp />;
}
