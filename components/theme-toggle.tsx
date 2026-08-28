"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Theme toggle. The server resolves the initial theme from the `theme`
 * cookie (see app/layout.tsx); system preference is handled by CSS when no
 * cookie exists. Clicking pins an explicit choice via the same cookie.
 */
export function ThemeToggle() {
  function handleToggle() {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";

    root.classList.toggle("dark", next === "dark");
    root.setAttribute("data-theme", next);

    // Persist so the server can render the right theme on the next request.
    document.cookie = `theme=${next};path=/;max-age=31536000;samesite=lax`;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      aria-label="Ganti tema terang / gelap"
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </Button>
  );
}
