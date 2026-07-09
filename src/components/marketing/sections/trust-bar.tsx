const OPERATORS = [
  "UrbanPark Holdings",
  "Metro Spaces",
  "SkyPort Aviation",
  "Civic Lots Co-op",
  "Bay Area Trust",
  "Harborline Parking",
];

export function TrustBar() {
  return (
    <section className="border-y border-border bg-surface-muted/50 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-6 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Trusted by parking operators across 40+ cities
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {OPERATORS.map((name) => (
            <span
              key={name}
              className="font-display text-[15px] font-semibold tracking-tight text-muted-foreground/70"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
