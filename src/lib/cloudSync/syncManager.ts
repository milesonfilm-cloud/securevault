let debounceId: ReturnType<typeof setTimeout> | null = null;

/** Debounced upload after vault saves (30s). */
export function scheduleDriveSyncDebounced(cloudSyncEnabled: boolean): void {
  if (typeof window === 'undefined' || !cloudSyncEnabled) return;
  if (debounceId) clearTimeout(debounceId);
  debounceId = setTimeout(() => {
    debounceId = null;
    void import('./googleDriveSync').then((m) => m.runDriveSyncIfPossible(true));
  }, 30_000);
}

export function cancelScheduledDriveSync(): void {
  if (debounceId) {
    clearTimeout(debounceId);
    debounceId = null;
  }
}
