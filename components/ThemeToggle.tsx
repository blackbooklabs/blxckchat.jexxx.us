"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { readEmpireTheme, writeEmpireTheme, subscribeEmpireTheme, Theme } from "@/lib/kingdom-theme";

const modes: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Light mode" },
  { value: "dark", icon: Moon, label: "Dark mode" },
  { value: "system", icon: Monitor, label: "System theme" },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    // Initial read
    setTheme(readEmpireTheme());

    // Subscribe to changes (updates the active state if synced from another tab/subdomain)
    const unsubscribe = subscribeEmpireTheme((newTheme) => {
      setTheme(newTheme);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggle = (value: Theme) => {
    setTheme(value);
    writeEmpireTheme(value);
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/60 p-1 backdrop-blur-sm">
      {modes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => handleToggle(value)}
          className={`p-1.5 rounded-full transition-colors ${
            theme === value
              ? "bg-pink-500/20 text-pink-500"
              : "text-muted hover:text-foreground hover:bg-muted/30"
          }`}
          title={label}
          aria-label={label}
          aria-pressed={theme === value}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}
