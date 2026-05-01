import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LayoutDashboard, FileText, CheckCircle, Share2, LogOut } from "lucide-react";
import { StackedLogo } from "@/components/StackedLogo";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: FileText, label: "Acadêmicos", path: "/admin/academicos" },
  { icon: FileText, label: "Editais", path: "/admin/editais" },
  { icon: CheckCircle, label: "Matches (IA)", path: "/admin/matches" },
  { icon: Share2, label: "Ver Grafo", path: "/admin/grafo" },
];

export function SidebarContent({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const initials = "AD";

  return (
    <>
      <div className="flex items-center gap-2 px-3 h-11 border-b border-sidebar-border">
        <StackedLogo size={16} color="currentColor" />
        {!collapsed && (
          <span className="font-bold uppercase tracking-[0.08em] text-[14px] text-sidebar-accent-foreground">
            ARIANO
          </span>
        )}
      </div>

      <nav className="flex-1 py-1.5 px-1.5 space-y-px">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== "/admin" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded text-[13px] transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-2 px-1">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-[9px] leading-none">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <span className="text-[12px] text-sidebar-foreground truncate flex-1">
              Admin
            </span>
          )}
          {!collapsed && (
            <>
              <ThemeToggleButton className="h-6 w-6" />
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-sidebar-foreground hover:bg-sidebar-accent h-6 w-6"
              >
                <LogOut className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden md:flex flex-col bg-sidebar border-r border-sidebar-border h-screen sticky top-0 w-52 shrink-0">
      <div className="flex flex-col flex-1 overflow-hidden">
        <SidebarContent />
      </div>
    </aside>
  );
}

export default function AppLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 flex md:hidden items-center justify-between h-11 border-b border-border bg-background px-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-52 bg-sidebar border-r border-border">
              <div className="flex flex-col h-full">
                <SidebarContent onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-1.5">
            <StackedLogo size={16} />
            <span className="font-bold uppercase tracking-[0.08em] text-[14px] text-foreground">ARIANO</span>
          </div>
          <ThemeToggleButton />
        </header>

        <main className="flex-1 overflow-auto relative">
          <div className="p-4 sm:p-8 max-w-[1400px] mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
