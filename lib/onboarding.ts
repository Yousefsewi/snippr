// "Set up your shop" wizard (app/onboarding). Remembered per account on this browser,
// so a barber who finished or skipped it is not sent there again.
export const onboardedKey = (userId: string) => `snippr:onboarded:${userId}`

export function isOnboarded(userId: string): boolean {
  try { return localStorage.getItem(onboardedKey(userId)) === '1' } catch { return true }
}

export function markOnboarded(userId: string) {
  try { localStorage.setItem(onboardedKey(userId), '1') } catch { /* storage blocked */ }
}
