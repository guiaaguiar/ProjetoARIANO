import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, GraduationCap,
  FileText, Network, Zap, Menu, X, ChevronLeft, Users,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Acadêmicos', path: '/academicos', icon: GraduationCap },
  { label: 'Editais', path: '/editais', icon: FileText },
  { label: 'Matches', path: '/matches', icon: Zap },
  { label: 'Grafo', path: '/grafo', icon: Network },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = collapsed ? 72 : 240;

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 min-w-[36px] rounded-lg bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center glow-accent">
            <Network className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="text-base font-bold text-text-primary tracking-tight">
                  ARIANO
                </h1>
                <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
                  v0 · CORETO
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-hover hidden lg:flex"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} className="text-text-muted hover:text-text-primary p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5">
        {(!collapsed || isMobile) && (
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-2 px-2.5">
            Menu
          </p>
        )}
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => isMobile && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${collapsed && !isMobile ? 'justify-center' : ''}
              ${isActive
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent'
              }`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-[18px] h-[18px] min-w-[18px]" />
            <AnimatePresence>
              {(!collapsed || isMobile) && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className={`flex items-center gap-2.5 px-2.5 py-2 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 min-w-[32px] rounded-full bg-accent/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-accent" />
          </div>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <p className="text-sm font-medium text-text-primary">Guilherme</p>
                <p className="text-[10px] text-text-muted">Product Owner</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 bottom-0 bg-surface border-r border-border z-50 hidden lg:flex flex-col"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden bg-surface border border-border rounded-lg p-2 text-text-primary hover:bg-surface-hover transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-[260px] bg-surface border-r border-border z-50 lg:hidden flex flex-col"
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for desktop content */}
      <div className="hidden lg:block" style={{ minWidth: sidebarWidth, transition: 'min-width 0.3s' }} />
    </>
  );
}
