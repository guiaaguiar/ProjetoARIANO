import { motion } from 'framer-motion';
import { Info, Network } from 'lucide-react';
import { NetworkXGraphView } from '../components/NetworkXGraphView';

export default function GrafoPage() {
  return (
    <div className="container-fluid py-4 h-[calc(100vh-88px)] lg:h-[calc(100vh-56px)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="page-header !mb-0"
        >
          <div className="flex items-center gap-3">
             <div className="p-2 bg-accent/10 rounded-xl border border-accent/20">
                <Network className="text-accent w-6 h-6" />
             </div>
             <div>
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">Motor Científico NetworkX</h1>
                <p className="text-sm text-text-secondary">
                    <span className="text-accent font-mono font-medium">100% Native Drawing</span> · {' '}
                    Comunidades de Pensamento (Graph-Of-Thoughts)
                </p>
             </div>
          </div>
        </motion.div>
      </div>

      {/* Graph Container (Pure NetworkX Engine) */}
      <div className="flex-1 min-h-0">
        <NetworkXGraphView />
      </div>

      {/* Hint & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-void/30 p-4 rounded-2xl border border-border/20 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-text-muted text-[11px]">
          <Info className="w-4 h-4 text-accent" />
          <span>Esta visualização é gerada inteiramente pelo motor matemático do <strong>NetworkX 3.6.1</strong> e renderizada via Matplotlib no backend.</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono text-green-500 uppercase tracking-wider">Engine Online</span>
            </div>
            <div className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Branch: Production (Vercel)</div>
        </div>
      </div>
    </div>
  );
}
