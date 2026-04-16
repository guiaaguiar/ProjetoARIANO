import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, LayoutDashboard, Zap, Network, Users, ChevronLeft, Menu, X
} from 'lucide-react';

const userNavItems = [
  { label: 'Painel Geral', path: '/user', icon: LayoutDashboard },
  { label: 'Meus Matches', path: '/user/matches', icon: Zap },
  { label: 'Meu Ecossistema', path: '/user/ecossistema', icon: Network },
  { label: 'Comunidades', path: '/user/comunidades', icon: Users },
];

export default function UserSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = collapsed ? 72 : 240;

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-5 border-b border-teal-500/10 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 min-w-[40px] flex items-center justify-center p-1 bg-teal-500/10 rounded-xl ring-1 ring-teal-500/20 shadow-lg shadow-teal-500/5">
            <img src="/Coreto_LOGO.png" alt="ARIANO" className="w-full h-full object-contain" />
          </div>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  ARIANO <span className="text-[10px] bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded uppercase tracking-widest">User</span>
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-teal-400 transition-colors p-1.5 rounded-lg hover:bg-white/[0.04] hidden lg:flex"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} className="text-gray-400 p-1.5"><X className="w-5 h-5" /></button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-hide">
        {userNavItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/user'}
            onClick={() => isMobile && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative
              ${collapsed && !isMobile ? 'justify-center' : ''}
              ${isActive
                ? 'bg-gradient-to-r from-teal-500/15 to-transparent text-teal-400 border border-teal-500/20 shadow-lg shadow-teal-500/5'
                : 'text-gray-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
              }`
            }
          >
            <Icon className="w-[18px] h-[18px] min-w-[18px] transition-transform duration-300 group-hover:scale-110" />
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
            
            {/* Active Indicator Dot */}
            <NavLink 
              to={path} 
              end={path === '/user'} 
              className={({isActive}) => isActive ? "absolute right-3 w-1.5 h-1.5 bg-teal-400 rounded-full shadow-[0_0_8px_rgba(45,212,191,0.6)]" : "hidden"} 
            />
          </NavLink>
        ))}
      </nav>

      {/* User Card */}
      <div className="p-4 border-t border-teal-500/10">
        <div className={`p-2.5 rounded-xl bg-gray-900/50 border border-teal-500/5 flex items-center gap-3 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 min-w-[36px] rounded-lg bg-teal-500/20 flex items-center justify-center ring-1 ring-teal-500/30">
            <User className="w-4 h-4 text-teal-400" />
          </div>
          <AnimatePresence>
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <p className="text-xs font-bold text-white truncate">Meu Perfil</p>
                <p className="text-[10px] text-gray-500 font-medium">Acadêmico</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 bottom-0 z-50 hidden lg:flex flex-col border-r border-teal-500/5 bg-gray-950/80 backdrop-blur-3xl"
      >
        <SidebarContent />
      </motion.aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden rounded-xl p-2.5 bg-gray-900/90 border border-teal-500/20 text-white backdrop-blur-xl"
      >
        <Menu className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="fixed left-0 top-0 bottom-0 w-[260px] z-[60] lg:hidden flex flex-col bg-gray-950 border-r border-teal-500/10">
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="hidden lg:block" style={{ minWidth: sidebarWidth, transition: 'min-width 0.3s' }} />
    </>
  );
}
