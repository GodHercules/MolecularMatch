export function parseCliArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};

  for (const item of argv) {
    if (!item.startsWith("--")) continue;
    const [key, value] = item.slice(2).split("=");
    if (value === undefined) {
      args[key] = true;
    } else {
      args[key] = value;
    }
  }

  return args;
}

export function asNumber(value: string | boolean | undefined, fallback: number): number {
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

export function asString(value: string | boolean | undefined, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function asBoolean(value: string | boolean | undefined, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return ["1", "true", "yes", "y"].includes(value.toLowerCase());
  }
  return fallback;
}

