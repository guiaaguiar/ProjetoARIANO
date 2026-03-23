import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, BookOpenText,
  FileText, Network, Zap, Settings,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Acadêmicos', path: '/academicos', icon: GraduationCap },
  { label: 'Editais', path: '/editais', icon: FileText },
  { label: 'Matches', path: '/matches', icon: Zap },
  { label: 'Grafo', path: '/grafo', icon: Network },
];

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      className="fixed left-0 top-0 bottom-0 w-[260px] bg-surface border-r border-border flex flex-col z-50"
    >
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent-dim flex items-center justify-center glow-accent">
            <Network className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary tracking-tight">
              ARIANO
            </h1>
            <p className="text-[11px] text-text-muted font-mono uppercase tracking-wider">
              v0 · CORETO
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium mb-3 px-3">
          Menu Principal
        </p>
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-accent/10 text-accent border border-accent/20 glow-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`
            }
          >
            <Icon className="w-[18px] h-[18px]" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">Guilherme</p>
            <p className="text-[11px] text-text-muted">Product Owner</p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

