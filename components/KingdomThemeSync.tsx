"use client";

import { useEffect, useRef } from "react";
import { readEmpireTheme, subscribeEmpireTheme, Theme } from "@/lib/kingdom-theme";
import { getResolvedTheme, applyResolvedTheme } from "@/lib/theme-transition";

export function KingdomThemeSync() {
  const isFirstRender = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    
    const handleThemeChange = (theme: Theme) => {
      const resolved = getResolvedTheme(theme);
      applyResolvedTheme(root, resolved, { animate: !isFirstRender.current });
      isFirstRender.current = false;
    };

    // Initial load
    const currentTheme = readEmpireTheme();
    handleThemeChange(currentTheme);

    // Subscribe to changes
    const unsubscribe = subscribeEmpireTheme(handleThemeChange);

    // Listen for OS preference changes if system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (readEmpireTheme() === 'system') {
        handleThemeChange('system');
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);

    return () => {
      unsubscribe();
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, []);

  return null;
}
