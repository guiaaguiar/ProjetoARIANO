import { Link, NavLink, useLocation } from "react-router-dom";
import { ThemeToggleButton } from "./ThemeToggleButton";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import LogoMenor from "@/assets/Coreto_LOGO_Menor.png";

const navItems = [
  { to: "/home", label: "Início" },
  { to: "/editais", label: "Editais" },
  { to: "/comunidades", label: "Comunidades" },
  { to: "/ecossistema", label: "Ecossistema" },
];

export function PublicHeader() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const firstName = user?.name ? user.name.split(" ")[0] : "Usuário";
  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "US";

  // Deterministic avatar seed based on user UID or name
  const avatarUrl = user?.uid 
    ? `https://picsum.photos/seed/${user.uid}/100/100`
    : `https://picsum.photos/seed/default/100/100`;

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur-md border-b border-border px-4 md:px-6">
      <div className="mx-auto flex h-[56px] max-w-[1280px] items-center justify-between gap-4">
        <Link to="/home" className="flex items-center gap-2.5 shrink-0">
          <img src={LogoMenor} alt="ARIANO Logo" className="h-[28px] w-auto object-contain" />
          <span className="text-[14px] font-bold text-foreground tracking-[0.08em] uppercase">ARIANO</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => {
            const active = location.pathname === item.to || 
              (item.to !== "/home" && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "px-3 h-8 flex items-center text-[13px] font-medium transition-colors rounded",
                  active
                    ? "text-foreground bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </NavLink>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          
          <Link
            to="/profile"
            className={cn(
              "flex items-center gap-2 h-9 pl-3 pr-1 rounded-full border transition-all",
              location.pathname === "/profile"
                ? "border-primary/60 bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-card"
            )}
            title="Ver perfil"
          >
            <span className="text-[13px] text-foreground hidden sm:inline">{firstName}</span>
            <div className="h-7 w-7 rounded-full ring-1 ring-border bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary overflow-hidden">
              {user?.uid ? (
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
          </Link>

          <button
            onClick={logout}
            title="Sair"
            className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-all"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-center gap-1 pb-2">
        {navItems.map((item) => {
          const active = location.pathname === item.to || 
            (item.to !== "/home" && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "px-3 h-7 flex items-center text-[12px] font-medium rounded transition-colors",
                active ? "text-foreground bg-primary/10" : "text-muted-foreground"
              )}
            >
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
