import Image from "next/image";

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
