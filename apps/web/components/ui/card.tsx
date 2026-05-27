import type React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/92 p-4 shadow-[0_12px_30px_-24px_hsl(var(--brand-blue))]",
        className
      )}
      {...props}
    />
  );
}

