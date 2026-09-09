import Image from "next/image";

// Source asset is 1774x887 (2:1) with a baked-in off-white background — it has
// no alpha channel, so it only sits cleanly on light surfaces. Size it by
// height and let the width follow, or it squashes.
//
// next/image handles the heavy source: it serves a resized, modern-format
// version rather than shipping the original 830 KB PNG to every visitor.
export function Logo({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/dgb_logo.png"
      alt="DGB India"
      width={1774}
      height={887}
      priority={priority}
      className={className}
    />
  );
}
