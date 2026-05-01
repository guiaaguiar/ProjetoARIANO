import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import wallpaperDark from "@/assets/wallpaper.png";
import wallpaperLight from "@/assets/wallpaper-light.png";

/**
 * Global fixed background that swaps between dark and light topographic wallpapers
 * based on the active theme. Sits behind all page content.
 */
export function AppBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  const overlay = isDark
    ? "linear-gradient(hsl(205 65% 5% / 0.55), hsl(205 65% 5% / 0.85))"
    : "linear-gradient(hsl(0 0% 100% / 0.55), hsl(0 0% 100% / 0.80))";

  const url = isDark ? wallpaperDark : wallpaperLight;
  const baseColor = isDark ? "hsl(205 65% 5%)" : "hsl(0 0% 100%)";

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        backgroundImage: `${overlay}, url(${url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundColor: baseColor,
      }}
    />
  );
}
