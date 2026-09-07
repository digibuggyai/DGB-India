// Light-theme status pills, keyed to the site palette — "new" uses the
// blush tint (--tint / --tint-foreground) that the public site uses for
// its highlight bands, so it reads as on-brand rather than generic.
const STATUS_STYLES: Record<string, string> = {
  new: "bg-[#ecdcdf] text-[#4d1219] border-[#d9bcc1]",
  contacted: "bg-[#e7eef7] text-[#1e3a5f] border-[#cfe0f0]",
  qualified: "bg-[#fdf3e3] text-[#6b4a10] border-[#f2e0bd]",
  proposal: "bg-[#efe9f7] text-[#43306b] border-[#ddd2ee]",
  won: "bg-[#e6f4ea] text-[#1e4d2b] border-[#cbe7d3]",
  lost: "bg-[#f0f1f2] text-[#5c6166] border-[#e0e2e4]",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
        STATUS_STYLES[status] || STATUS_STYLES.new
      }`}
    >
      {status}
    </span>
  );
}
