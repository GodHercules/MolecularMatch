import type React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-card/88 px-3 py-2 text-sm shadow-[0_6px_16px_-14px_hsl(var(--brand-blue-strong))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary",
        className
      )}
      {...props}
    />
  );
}

