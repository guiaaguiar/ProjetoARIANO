import { useEffect } from "react";
import { useTheme } from "next-themes";
import { Outlet } from "react-router-dom";
import { PublicHeader } from "../PublicHeader";

/** Wallpaper-derived dark tokens (matched to Landing) */
const WP = {
  bg: "205 65% 5%",
  card: "205 55% 8%",
  border: "190 40% 18%",
  mutedFg: "195 20% 65%",
  fg: "190 25% 92%",
  accent: "188 85% 45%",
  accentLight: "190 80% 38%",
};

function useArianoPalette() {
  const { theme } = useTheme();
  useEffect(() => {
    const root = document.documentElement;
    const dark = theme === "dark";
    const accent = dark ? WP.accent : WP.accentLight;
    root.style.setProperty("--primary", accent);
    root.style.setProperty("--ring", accent);
    root.style.setProperty("--sidebar-primary", accent);
    root.style.setProperty("--sidebar-ring", accent);

    if (dark) {
      root.style.setProperty("--background", WP.bg);
      root.style.setProperty("--foreground", WP.fg);
      root.style.setProperty("--card", WP.card);
      root.style.setProperty("--card-foreground", WP.fg);
      root.style.setProperty("--popover", WP.card);
      root.style.setProperty("--popover-foreground", WP.fg);
      root.style.setProperty("--secondary", WP.card);
      root.style.setProperty("--muted", WP.card);
      root.style.setProperty("--muted-foreground", WP.mutedFg);
      root.style.setProperty("--accent", WP.card);
      root.style.setProperty("--border", WP.border);
      root.style.setProperty("--input", WP.border);
    }

    return () => {
      [
        "--primary", "--ring", "--sidebar-primary", "--sidebar-ring",
        "--background", "--foreground", "--card", "--card-foreground",
        "--popover", "--popover-foreground", "--secondary", "--muted",
        "--muted-foreground", "--accent", "--border", "--input",
      ].forEach((v) => root.style.removeProperty(v));
    };
  }, [theme]);
}

export function PublicLayout({ children }: { children?: React.ReactNode }) {
  useArianoPalette();
  return (
    <div className="relative min-h-screen flex flex-col text-foreground">
      <PublicHeader />
      <main className="flex-1 overflow-auto">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}

export default PublicLayout;
