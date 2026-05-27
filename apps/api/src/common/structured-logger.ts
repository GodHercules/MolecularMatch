import { Injectable, LoggerService } from "@nestjs/common";

@Injectable()
export class StructuredLogger implements LoggerService {
  log(message: string, context?: string) {
    console.log(JSON.stringify({ level: "info", message, context, at: new Date().toISOString() }));
  }

  error(message: string, trace?: string, context?: string) {
    console.error(
      JSON.stringify({ level: "error", message, trace, context, at: new Date().toISOString() })
    );
  }

  warn(message: string, context?: string) {
    console.warn(JSON.stringify({ level: "warn", message, context, at: new Date().toISOString() }));
  }

  debug(message: string, context?: string) {
    console.debug(
      JSON.stringify({ level: "debug", message, context, at: new Date().toISOString() })
    );
  }

  verbose(message: string, context?: string) {
    console.debug(
      JSON.stringify({ level: "verbose", message, context, at: new Date().toISOString() })
    );
  }
}

