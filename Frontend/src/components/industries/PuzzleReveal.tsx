const DELAYS = [0.9, 0.15, 1.35, 0.45, 1.65, 0.6, 1.05, 0.3, 1.8, 0.75, 1.5, 1.2];

export function PuzzleReveal({ imageUrl }: { imageUrl?: string | null }) {
  return (
    <div
      className="relative h-[420px] w-full overflow-hidden rounded-lg bg-[#eef1f3] bg-cover bg-center"
      style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
    >
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-4">
        {DELAYS.map((delay, i) => (
          <div
            key={i}
            className="dgb-puzzle-tile bg-white"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
    </div>
  );
}
