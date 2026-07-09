import Link from "next/link";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-10 items-center justify-center",
        className,
      )}
    >
      <svg
        viewBox="80 40 520 340"
        xmlns="http://www.w3.org/2000/svg"
        className="size-full"
      >
        {/* Pagoda */}
        <g id="pagoda">
          <polygon points="320,20 340,80 300,80" fill="#0F3460"/>
          <rect x="270" y="85" width="100" height="50" fill="#0F3460"/>
          <polygon points="270,85 220,120 320,120 370,85" fill="#0F3460"/>
          <rect x="240" y="140" width="160" height="60" fill="#0F3460"/>
          <polygon points="240,140 180,180 380,180 420,140" fill="#0F3460"/>
          <rect x="210" y="210" width="220" height="120" fill="#0F3460"/>
          <polygon points="210,210 150,260 450,260 510,210" fill="#0F3460"/>
        </g>

        {/* Mountain */}
        <g id="mountain">
          <polygon points="420,120 520,280 320,280" fill="white" opacity="0.85"/>
          <polygon points="460,120 540,260 380,260" fill="white"/>
        </g>

        {/* Car Icon */}
        <g id="car">
          <rect x="370" y="280" width="80" height="40" rx="8" fill="none" stroke="#0F3460" strokeWidth="3"/>
          <line x1="385" y1="320" x2="385" y2="335" stroke="#0F3460" strokeWidth="3"/>
          <line x1="435" y1="320" x2="435" y2="335" stroke="#0F3460" strokeWidth="3"/>
          <circle cx="385" cy="340" r="8" fill="none" stroke="#0F3460" strokeWidth="2"/>
          <circle cx="435" cy="340" r="8" fill="none" stroke="#0F3460" strokeWidth="2"/>
        </g>

        {/* Location Pin */}
        <g id="pin">
          <path d="M 220 300 C 200 275 190 260 190 240 C 190 210 210 190 240 190 C 270 190 290 210 290 240 C 290 260 280 275 260 300 C 240 330 220 360 220 360 C 220 360 200 330 220 300 Z" fill="none" stroke="#2ecc71" strokeWidth="5"/>
          <circle cx="240" cy="240" r="15" fill="#2ecc71"/>
        </g>

        {/* Letter P */}
        <g id="letter-p">
          <path d="M 550 50 L 550 300 M 550 50 L 650 50 Q 700 50 700 120 Q 700 180 650 180 L 550 180" fill="none" stroke="#0F3460" strokeWidth="25" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
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
          <span className="text-[#0F3460]">Hamro</span>
          <span className="text-[#2ecc71]">Park</span>
        </span>
      )}
    </Link>
  );
}
