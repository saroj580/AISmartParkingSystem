import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leadingIcon, trailing, ...props }, ref) => {
    if (leadingIcon || trailing) {
      return (
        <div
          className={cn(
            "flex h-10 items-center gap-2 rounded-[var(--radius-md)] border border-input bg-surface px-3 shadow-xs transition-colors focus-within:border-brand focus-within:ring-2 focus-within:ring-ring/25",
            className,
          )}
        >
          {leadingIcon && (
            <span className="text-muted-foreground [&_svg]:size-4">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-50"
            {...props}
          />
          {trailing}
        </div>
      );
    }
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[var(--radius-md)] border border-input bg-surface px-3 text-sm shadow-xs transition-colors placeholder:text-muted-foreground/70 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
