import React from 'react';
import { 
  RotateCcw, 
  Download, 
  Undo2, 
  Redo2, 
  MousePointer2, 
  CircleDot, 
  Layers, 
  Info,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToolbarProps {
  onReset: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  polygons: any[];
  activePolygon: any | null;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onReset,
  onExport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  polygons,
  activePolygon,
}) => {
  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex flex-col gap-6 w-72 p-6 glass rounded-2xl border border-white/10"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
          <Layers size={20} />
        </div>
        <h2 className="font-semibold text-lg tracking-tight">Annotations</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={onUndo}
          disabled={!canUndo}
          className="btn btn-secondary disabled:opacity-30 disabled:cursor-not-allowed group"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={18} className="transition-transform group-active:-rotate-45" />
          <span>Undo</span>
        </button>
        <button 
          onClick={onRedo}
          disabled={!canRedo}
          className="btn btn-secondary disabled:opacity-30 disabled:cursor-not-allowed group"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={18} className="transition-transform group-active:rotate-45" />
          <span>Redo</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-medium text-zinc-500 uppercase tracking-widest">
          Annotation Tools
        </div>
        <div className="space-y-2">
          <button 
            className={`btn w-full items-start justify-start gap-3 transition-all ${
              !activePolygon ? 'btn-ghost text-zinc-400' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}
          >
            <div className={`p-1 rounded ${activePolygon ? 'bg-blue-500 text-white' : 'bg-zinc-800'}`}>
              <CircleDot size={14} />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium">Drawing Active</div>
              <div className="text-xs opacity-60">
                {activePolygon ? `${activePolygon.points.length} vertices` : 'Idle'}
              </div>
            </div>
          </button>
          
          <button 
            onClick={onReset}
            className="btn btn-ghost w-full justify-start gap-4 hover:bg-red-500/10 hover:text-red-400"
          >
            <RotateCcw size={18} />
            <span>Reset All</span>
          </button>
        </div>
      </div>

      <div className="flex-grow min-h-[100px]">
        <div className="flex items-center justify-between text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
          History ({polygons.length})
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence>
            {polygons.map((poly, idx) => (
              <motion.div 
                key={poly.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: poly.color }} />
                  <span className="text-sm font-medium text-zinc-300">Polygon {idx + 1}</span>
                </div>
                <div className="text-xs text-zinc-500 tabular-nums">{poly.points.length} pts</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <button 
        onClick={onExport}
        className="btn btn-primary w-full py-4 text-base shadow-xl shadow-blue-500/20 hover:scale-[1.02]"
      >
        <Download size={20} />
        <span>Export JSON</span>
      </button>

      <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5">
        <div className="flex gap-2 items-start text-zinc-500 text-xs leading-relaxed">
          <Info size={14} className="shrink-0 mt-0.5" />
          <p>Click image to draw. Drag vertices to adjust. Hover first vertex to close. Ctrl+Z to undo.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Toolbar;
