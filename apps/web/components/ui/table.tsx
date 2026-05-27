import type React from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full text-sm", className)} {...props} />;
}

export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "border-b border-border/70 bg-muted/45 px-3 py-2 text-left text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("border-b border-border/50 px-3 py-2.5 align-top text-foreground/90 last:border-b-0", className)} {...props} />
  );
}
