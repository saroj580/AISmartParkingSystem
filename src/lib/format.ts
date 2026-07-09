export function formatCurrency(
  amount: number,
  currency = "INR",
  opts: Intl.NumberFormatOptions = {},
) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    ...opts,
  }).format(amount);
}

/** Compact en-IN notation — 2.5L, 1.5Cr — for chart axes and stat tiles. */
export function formatCompact(n: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}

export function formatDate(
  date: Date | string,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" },
) {
  return new Intl.DateTimeFormat("en-US", opts).format(new Date(date));
}

export function formatTime(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string) {
  return `${formatDate(date)} · ${formatTime(date)}`;
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function relativeTime(date: Date | string) {
  const d = new Date(date).getTime();
  const now = Date.now();
  const diff = d - now;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400000],
    ["hour", 3600000],
    ["minute", 60000],
    ["second", 1000],
  ];
  for (const [unit, ms] of units) {
    if (abs >= ms || unit === "second") {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
  return "just now";
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}