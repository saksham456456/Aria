// Client-side cooldown map: Concept/EventType -> Timestamp
export const ariaCooldowns = new Map<string, number>();

export function shouldSuppressIntervention(type: string, concept?: string, isTeacherCommand = false): boolean {
  if (isTeacherCommand) return false;

  const now = Date.now();

  // Any intervention within 15s is suppressed
  const lastGlobal = ariaCooldowns.get('__global__') || 0;
  if (now - lastGlobal < 15000) return true;

  if (concept) {
     // Same concept within 90s is suppressed
     const lastConcept = ariaCooldowns.get(`concept:${concept}`) || 0;
     if (now - lastConcept < 90000) return true;
  }

  return false;
}

export function recordInterventionCooldown(concept?: string) {
  const now = Date.now();
  ariaCooldowns.set('__global__', now);
  if (concept) {
    ariaCooldowns.set(`concept:${concept}`, now);
  }
}
