/** Manual sidebar projects use this default title and may be duplicated. */
export const MANUAL_PROJECT_TITLE = 'New Project';

export function normalizeDivinityProjectTitle(title: string): string {
  return title.trim().toLowerCase();
}

export function isManualProjectTitle(title: string): boolean {
  return normalizeDivinityProjectTitle(title) === normalizeDivinityProjectTitle(MANUAL_PROJECT_TITLE);
}

/** Divinity-named projects dedupe by normalized title; manual "New Project" entries do not. */
export function divinityTitlesMatch(a: string, b: string): boolean {
  return normalizeDivinityProjectTitle(a) === normalizeDivinityProjectTitle(b);
}

type TitledProject = { id: string; title: string; updated_at?: string; created_at?: string };

/** When duplicates exist, prefer the oldest project (stable canonical folder per Divinity). */
export function pickCanonicalDivinityProject<T extends TitledProject>(
  projects: T[],
  divinityTitle: string,
): T | undefined {
  const normalized = normalizeDivinityProjectTitle(divinityTitle);
  const matches = projects.filter(
    (p) => normalizeDivinityProjectTitle(p.title) === normalized,
  );
  if (matches.length === 0) return undefined;
  if (matches.length === 1) return matches[0];
  return [...matches].sort((a, b) => {
    const ca = new Date(a.created_at ?? 0).getTime();
    const cb = new Date(b.created_at ?? 0).getTime();
    return ca - cb;
  })[0];
}