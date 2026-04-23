import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import * as api from '../lib/api';

export const NetworkXGraphView: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const fetchGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getGraphDrawing();
      if (res.error) {
        setError(res.error);
      } else {
        setImage(res.image);
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao gerar visualização NetworkX');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const handleZoom = (factor: number) => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev * factor)));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#020810] rounded-3xl border border-border/40">
        <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
        <div className="text-center space-y-2">
            <p className="text-text-primary font-bold text-lg">Drawing 100% NetworkX...</p>
            <p className="text-text-secondary font-mono text-xs uppercase tracking-widest animate-pulse">
              Gerando plotagem via Matplotlib (Backend)
            </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#020810] rounded-3xl border border-red-500/30 p-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-text-primary mb-2">Erro no NetworkX Engine</h3>
        <p className="text-text-secondary mb-6 max-w-md">{error}</p>
        <button 
          onClick={fetchGraph}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw size={18} /> Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-[#020810] rounded-3xl overflow-hidden border border-border/30 shadow-2xl group flex items-center justify-center">
      {/* 100% Native NetworkX Drawing */}
      {image ? (
        <div 
            className="w-full h-full flex items-center justify-center overflow-auto"
            style={{ cursor: 'zoom-in' }}
        >
            <img 
                src={image} 
                alt="NetworkX Native Drawing" 
                className="max-w-none transition-transform duration-300 ease-out"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
            />
        </div>
      ) : (
        <p className="text-text-muted">Nenhuma visualização disponível.</p>
      )}

      {/* Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <button onClick={() => handleZoom(1.2)} className="btn-icon bg-surface/80 backdrop-blur-md border-accent/20 text-accent hover:bg-accent hover:text-void"><ZoomIn size={18} /></button>
        <button onClick={() => handleZoom(0.8)} className="btn-icon bg-surface/80 backdrop-blur-md border-accent/20 text-accent hover:bg-accent hover:text-void"><ZoomOut size={18} /></button>
        <button onClick={() => setZoom(1)} className="btn-icon bg-surface/80 backdrop-blur-md border-accent/20 text-accent hover:bg-accent hover:text-void"><Maximize2 size={18} /></button>
        <button onClick={fetchGraph} className="btn-icon bg-accent/20 backdrop-blur-md border-accent/40 text-accent hover:bg-accent hover:text-void mt-2"><RefreshCw size={18} /></button>
      </div>

      {/* Info Badge */}
      <div className="absolute top-6 left-6 flex flex-col gap-3">
        <div className="bg-void/80 backdrop-blur-xl border border-accent/20 p-4 rounded-2xl shadow-2xl">
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-accent font-bold mb-1 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            NetworkX 100% Native
          </h4>
          <p className="text-[9px] text-text-secondary mb-3">Backend-Rendered Matplotlib Plot</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-[9px] text-text-primary">Comunidades de Pensamento (CoT)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-[9px] text-text-primary">Spring Layout (nx.spring_layout)</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-6 flex items-center gap-2 text-[10px] text-text-muted bg-void/60 px-3 py-2 rounded-full backdrop-blur-sm border border-border/20">
        <Info size={12} className="text-accent" />
        Esta imagem é gerada diretamente pelo código Python do NetworkX.
      </div>
    </div>
  );
};

const Info = ({ size, className }: { size: number, className: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
    </svg>
);
