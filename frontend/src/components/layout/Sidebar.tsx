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
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 min-w-[36px] flex items-center justify-center">
            <img src="/Coreto_LOGO.png" alt="ARIANO Logo" className="w-full h-full object-contain" />
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
                <p className="text-[10px] text-accent font-mono uppercase tracking-wider">
                  v0 · CORETO
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-text-muted hover:text-accent transition-colors p-1.5 rounded-lg hover:bg-white/[0.04] hidden lg:flex"
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-white/[0.04]"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {(!collapsed || isMobile) && (
          <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold mb-3 px-2.5">
            Menu
          </p>
        )}
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            onClick={() => isMobile && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
              ${collapsed && !isMobile ? 'justify-center' : ''}
              ${isActive
                ? 'bg-accent/[0.08] text-accent border border-accent/20 shadow-[0_0_12px_rgba(45,212,191,0.06)]'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.03] border border-transparent'
              }`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-[18px] h-[18px] min-w-[18px] transition-transform duration-200 group-hover:scale-110" />
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
      <div className="p-3 border-t border-white/[0.06]">
        <div className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg hover:bg-white/[0.03] transition-all cursor-pointer ${collapsed && !isMobile ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 min-w-[32px] rounded-full bg-accent/15 flex items-center justify-center ring-1 ring-accent/20">
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
                <p className="text-[10px] text-text-muted font-medium">Product Owner</p>
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
        className="fixed left-0 top-0 bottom-0 z-50 hidden lg:flex flex-col"
        style={{
          background: 'rgba(10, 22, 40, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(26, 58, 82, 0.5)',
        }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden rounded-lg p-2.5 text-text-primary transition-all"
        style={{
          background: 'rgba(16, 27, 46, 0.9)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(26, 58, 82, 0.5)',
        }}
        aria-label="Abrir menu"
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
              className="fixed left-0 top-0 bottom-0 w-[260px] z-50 lg:hidden flex flex-col"
              style={{
                background: 'rgba(10, 22, 40, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(26, 58, 82, 0.5)',
              }}
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
