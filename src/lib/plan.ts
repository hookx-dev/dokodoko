export type Plan = "free" | "premium";

export const FREE_PLAN_LIMITS = {
  maxMaps: 2,
  maxMembersPerMap: 2,
  maxActiveWantToGoPins: 15,
  maxNewWantToGoPinsPerDay: 3,
} as const;

export const PREMIUM_PRICE_JPY = 500;

export function canCreateMap(ownerPlan: Plan, currentMapCount: number): boolean {
  if (ownerPlan === "premium") return true;
  return currentMapCount < FREE_PLAN_LIMITS.maxMaps;
}

export function canJoinMap(ownerPlan: Plan, currentMemberCount: number): boolean {
  if (ownerPlan === "premium") return true;
  return currentMemberCount < FREE_PLAN_LIMITS.maxMembersPerMap;
}

export function canAddWantToGoPin(
  ownerPlan: Plan,
  activeWantToGoCount: number,
  wantToGoAddedTodayCount: number
): { allowed: boolean; reason?: "total_limit" | "daily_limit" } {
  if (ownerPlan === "premium") return { allowed: true };
  if (activeWantToGoCount >= FREE_PLAN_LIMITS.maxActiveWantToGoPins) {
    return { allowed: false, reason: "total_limit" };
  }
  if (wantToGoAddedTodayCount >= FREE_PLAN_LIMITS.maxNewWantToGoPinsPerDay) {
    return { allowed: false, reason: "daily_limit" };
  }
  return { allowed: true };
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
