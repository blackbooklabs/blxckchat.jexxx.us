export type SidebarExpandedState = {
  divinityFolders: string[];
  projectIds: string[];
};

export const DEFAULT_DIVINITY_FOLDERS = [
  "Agents",
  "Agents/Luna Verde",
  "Agents/Xena (Venus) Azul",
  "Biblical",
] as const;

export function sidebarExpandedStorageKey(userId: string): string {
  return `blxckchat-sidebar-expanded-${userId}`;
}

export function loadSidebarExpanded(
  userId: string | null | undefined,
): SidebarExpandedState | null {
  if (!userId || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(sidebarExpandedStorageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SidebarExpandedState>;
    return {
      divinityFolders: Array.isArray(parsed.divinityFolders)
        ? parsed.divinityFolders.filter((k) => typeof k === "string")
        : [],
      projectIds: Array.isArray(parsed.projectIds)
        ? parsed.projectIds.filter((k) => typeof k === "string")
        : [],
    };
  } catch {
    return null;
  }
}

export function saveSidebarExpanded(
  userId: string,
  state: SidebarExpandedState,
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(sidebarExpandedStorageKey(userId), JSON.stringify(state));
}