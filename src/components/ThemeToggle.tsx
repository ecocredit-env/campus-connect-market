import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

function getInitial(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = getInitial();
    setTheme(t);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-muted-foreground backdrop-blur-md transition-all hover:bg-white/[0.1] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Sun className={`absolute h-3.5 w-3.5 transition-all ${isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"}`} />
      <Moon className={`absolute h-3.5 w-3.5 transition-all ${isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"}`} />
    </button>
  );
}
