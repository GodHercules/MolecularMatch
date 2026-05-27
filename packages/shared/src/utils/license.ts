import { AppMode, LicenseType } from "../types";

export function canUseSource(
  licenseType: LicenseType,
  appMode: AppMode,
  includeRestrictedSources: boolean
): boolean {
  if (appMode === "commercial") {
    return licenseType === "open";
  }

  if (licenseType === "restricted_commercial_use") {
    return includeRestrictedSources;
  }

  return true;
}

export function getLicenseWarnings(
  licenseTypes: LicenseType[],
  appMode: AppMode
): string[] {
  const warnings: string[] = [];
  if (licenseTypes.includes("restricted_commercial_use")) {
    warnings.push(
      "Fonte com uso comercial restrito detectada. Revise os termos de licenca antes de uso externo."
    );
  }
  if (appMode === "commercial" && licenseTypes.includes("restricted_commercial_use")) {
    warnings.push("Dados restritos foram bloqueados no modo comercial.");
  }
  return warnings;
}

