/**
 * Theme Transition utilities
 */

import { Theme } from "./kingdom-theme";

export function getResolvedTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark'; // Fallback
  }
  return theme;
}

export function applyResolvedTheme(root: HTMLElement, resolved: 'light' | 'dark', options: { animate: boolean }) {
  if (options.animate) {
    root.classList.add('theme-transition');
    // Remove it after transition ends (400ms)
    setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 400);
  }
  
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
}
