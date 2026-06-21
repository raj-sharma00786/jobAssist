"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setMounted(true), 0);

    return () => window.clearTimeout(timeout);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-full border border-outline-variant bg-surface hover:bg-surface-container transition-colors">
        <Sun className="h-[1.2rem] w-[1.2rem] text-transparent" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2 rounded-full border border-outline-variant bg-surface hover:bg-surface-container transition-colors relative flex items-center justify-center text-foreground"
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] transition-all scale-100 rotate-0 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] transition-all scale-0 rotate-90 dark:rotate-0 dark:scale-100" />
    </button>
  );
}
