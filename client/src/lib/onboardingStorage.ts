const STORAGE_KEY = 'spacilly-buyer-onboarding-v1';

export function isOnboardingComplete(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'done';
  } catch {
    return true;
  }
}

export function markOnboardingComplete(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, 'done');
  } catch {
    /* ignore quota / private mode */
  }
}

export function resetOnboardingForDev(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
