import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HealthService } from "./health.service";

@ApiTags("health")
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get("health")
  health() {
    return this.healthService.status();
  }
}

