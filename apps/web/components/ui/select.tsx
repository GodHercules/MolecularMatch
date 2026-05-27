import type React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-card/82 px-3 py-2 text-sm text-foreground shadow-[0_10px_20px_-18px_hsl(var(--brand-blue))] focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
        className
      )}
      {...props}
    />
  );
}
