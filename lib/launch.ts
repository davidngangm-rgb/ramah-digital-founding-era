export const FOUNDING_ERA_LAUNCH_ISO = "2026-08-30T00:00:00.000Z";
export const FOUNDING_ERA_LAUNCH_TIME_ZONE = "UTC";

export type FoundingEraPhase = "prelaunch" | "open";

export function getFoundingEraPhase(now: number | Date = Date.now()): FoundingEraPhase {
  const timestamp = now instanceof Date ? now.getTime() : now;
  return timestamp < Date.parse(FOUNDING_ERA_LAUNCH_ISO) ? "prelaunch" : "open";
}

export function getFoundingEraCta(kind?: "host" | "traveler", now?: number | Date) {
  const prelaunch = getFoundingEraPhase(now) === "prelaunch";
  if (!kind) return prelaunch ? "Pre-register" : "Claim your place";
  return prelaunch
    ? `Pre-register as a Founding ${kind === "host" ? "Host" : "Traveler"}`
    : `Become a Founding ${kind === "host" ? "Host" : "Traveler"}`;
}
