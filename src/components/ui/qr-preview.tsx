import { cn } from "@/lib/cn";

/**
 * Deterministic faux-QR renderer. Produces a stable, scannable-looking
 * matrix from a token string — no external QR dependency needed for the UI.
 */
function hashToBits(seed: string, count: number): boolean[] {
  let h = 2166136261;
  const bits: boolean[] = [];
  for (let i = 0; i < count; i++) {
    h ^= seed.charCodeAt(i % seed.length) + i * 31;
    h = Math.imul(h, 16777619);
    bits.push(((h >>> (i % 13)) & 1) === 1);
  }
  return bits;
}

export function QrPreview({
  token,
  size = 21,
  className,
}: {
  token: string;
  size?: number;
  className?: string;
}) {
  const bits = hashToBits(token, size * size);

  const isFinder = (r: number, c: number) => {
    const inBox = (br: number, bc: number) =>
      r >= br && r < br + 7 && c >= bc && c < bc + 7;
    return inBox(0, 0) || inBox(0, size - 7) || inBox(size - 7, 0);
  };
  const finderFill = (r: number, c: number) => {
    const rel = (br: number, bc: number) => {
      const rr = r - br;
      const cc = c - bc;
      const edge = rr === 0 || rr === 6 || cc === 0 || cc === 6;
      const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
      return edge || core;
    };
    if (r < 7 && c < 7) return rel(0, 0);
    if (r < 7 && c >= size - 7) return rel(0, size - 7);
    if (r >= size - 7 && c < 7) return rel(size - 7, 0);
    return false;
  };

  return (
    <div
      className={cn("aspect-square w-full", className)}
      role="img"
      aria-label="Parking pass QR code"
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-full w-full"
        shapeRendering="crispEdges"
      >
        <rect width={size} height={size} fill="transparent" />
        {Array.from({ length: size * size }).map((_, i) => {
          const r = Math.floor(i / size);
          const c = i % size;
          const fill = isFinder(r, c) ? finderFill(r, c) : bits[i];
          if (!fill) return null;
          return (
            <rect
              key={i}
              x={c}
              y={r}
              width={1}
              height={1}
              rx={0.28}
              className="fill-foreground"
            />
          );
        })}
      </svg>
    </div>
  );
}
