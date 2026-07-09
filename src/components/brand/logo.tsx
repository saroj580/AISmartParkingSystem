import Link from "next/link";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-8 items-center justify-center rounded-[10px] bg-brand text-brand-foreground shadow-[var(--shadow-glow)]",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-[18px]"
        strokeWidth={2.4}
      >
        <path
          d="M7 20V4h6.2a5 5 0 0 1 0 10H7"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  href = "/",
  showWord = true,
}: {
  className?: string;
  href?: string;
  showWord?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 outline-none",
        className,
      )}
    >
      <LogoMark />
      {showWord && (
        <span className="font-display text-[19px] font-600 font-semibold tracking-tight">
          Parkly
        </span>
      )}
    </Link>
  );
}
