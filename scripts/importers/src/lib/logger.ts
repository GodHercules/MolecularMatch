export class ImportLogger {
  constructor(private readonly scope: string) {}

  info(message: string, extra: Record<string, unknown> = {}) {
    console.log(
      JSON.stringify({ level: "info", scope: this.scope, message, ...extra, at: new Date().toISOString() })
    );
  }

  warn(message: string, extra: Record<string, unknown> = {}) {
    console.warn(
      JSON.stringify({ level: "warn", scope: this.scope, message, ...extra, at: new Date().toISOString() })
    );
  }

  error(message: string, extra: Record<string, unknown> = {}) {
    console.error(
      JSON.stringify({ level: "error", scope: this.scope, message, ...extra, at: new Date().toISOString() })
    );
  }
}

export function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

