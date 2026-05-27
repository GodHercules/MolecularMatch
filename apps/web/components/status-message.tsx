import { AlertTriangle, CheckCircle2, Info, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "error" | "warning" | "info" | "success" | "network";

const styles: Record<Tone, { icon: typeof Info; className: string }> = {
  error: {
    icon: AlertTriangle,
    className: "border-danger/35 bg-danger/10 text-danger"
  },
  warning: {
    icon: AlertTriangle,
    className: "border-warning/40 bg-warning/10 text-foreground"
  },
  info: {
    icon: Info,
    className: "border-border bg-muted/60 text-foreground"
  },
  success: {
    icon: CheckCircle2,
    className: "border-success/35 bg-success/12 text-foreground"
  },
  network: {
    icon: WifiOff,
    className: "border-danger/35 bg-danger/10 text-foreground"
  }
};

export default function StatusMessage({
  title,
  description,
  tone = "info",
  className
}: {
  title: string;
  description?: string;
  tone?: Tone;
  className?: string;
}) {
  const Icon = styles[tone].icon;

  return (
    <div className={cn("rounded-2xl border p-3", styles[tone].className, className)} role="status" aria-live="polite">
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">{title}</p>
          {description ? <p className="text-sm opacity-90">{description}</p> : null}
        </div>
      </div>
    </div>
  );
}
