import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";

@Injectable()
export class HealthService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async status() {
    const dbOk = this.connection.readyState === 1;
    return {
      api: "ok",
      database: dbOk ? "connected" : "disconnected",
      timestamp: new Date().toISOString()
    };
  }
}

