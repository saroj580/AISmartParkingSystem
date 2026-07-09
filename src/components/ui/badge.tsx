import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-medium whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        neutral: "bg-muted text-muted-foreground",
        brand: "bg-brand-subtle text-brand-subtle-foreground",
        available: "bg-available-subtle text-available",
        limited: "bg-limited-subtle text-limited",
        full: "bg-full-subtle text-full",
        outline: "border border-border text-muted-foreground",
        success: "bg-available-subtle text-available",
      },
      size: {
        sm: "text-[11px] px-2 py-0.5 rounded-md",
        md: "text-xs px-2.5 py-1 rounded-md",
      },
    },
    defaultVariants: { variant: "neutral", size: "md" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({
  className,
  variant,
  size,
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {dot && (
        <span className="size-1.5 rounded-full bg-current opacity-80" />
      )}
      {children}
    </span>
  );
}

export { badgeVariants };
