import React, { useRef } from 'react';
import {
  RotateCcw,
  Download,
  Undo2,
  Redo2,
  Tractor,
  Maximize2,
  Trash2,
  Image as ImageIcon,
  RotateCw,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Polygon } from './types';

interface ToolbarProps {
  darkMode: boolean;
  onReset: () => void;
  onExport: () => void;
  onSaveImage: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
  onRotate: () => void;
  canUndo: boolean;
  canRedo: boolean;
  polygons: Polygon[];
  activePolygon: Polygon | null;
  onCloseMobile?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  darkMode,
  onReset,
  onExport,
  onSaveImage,
  onUndo,
  onRedo,
  onUpload,
  onDelete,
  onRotate,
  canUndo,
  canRedo,
  polygons,
  activePolygon,
  onCloseMobile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  const closedPolygons = polygons.filter(p => p.isClosed);
  const borderColor = darkMode ? 'border-slate-800' : 'border-slate-200';
  const itemBg = darkMode ? 'bg-slate-900/50' : 'bg-white';
  const iconColor = darkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`flex flex-col gap-6 w-full md:w-80 p-4 md:p-6 ${darkMode ? 'bg-[#16191f]' : 'bg-slate-50'} border-b md:border-r ${borderColor} h-auto md:h-full overflow-y-auto md:overflow-hidden transition-colors duration-300 z-20 custom-scrollbar`}>
      {/* Mobile Top Header */}
      {onCloseMobile && (
        <div className="flex items-center justify-between md:hidden mb-2">
          <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">Toolkit</span>
          <button onClick={onCloseMobile} className="p-2 -mr-2 text-slate-400 hover:text-indigo-500">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Search/Upload Section */}
      <div className="space-y-3">
        <label className="text-[12px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Source Management</label>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-3 w-full px-3.5 py-2 mt-3 rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-[0.98]"
        >
          <ImageIcon size={18} />
          <span className="text-sm font-bold">Try with another image</span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>

      {/* Tools Section */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Manipulation Tools</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border ${borderColor} ${itemBg} hover:border-indigo-500/50 hover:shadow-lg transition-all disabled:opacity-30 group`}
          >
            <Undo2 size={18} className={`${iconColor} group-hover:text-indigo-500 mb-1`} />
            <span className="text-[10px] font-bold opacity-60">Undo</span>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border ${borderColor} ${itemBg} hover:border-indigo-500/50 hover:shadow-lg transition-all disabled:opacity-30 group`}
          >
            <Redo2 size={18} className={`${iconColor} group-hover:text-indigo-500 mb-1`} />
            <span className="text-[10px] font-bold opacity-60">Redo</span>
          </button>
          <button
            onClick={onRotate}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border ${borderColor} ${itemBg} hover:border-indigo-500/50 hover:shadow-lg transition-all group`}
          >
            <RotateCw size={18} className={`${iconColor} group-hover:text-indigo-500 mb-1`} />
            <span className="text-[10px] font-bold opacity-60">Rotate 90°</span>
          </button>
          <button
            onClick={onReset}
            className={`flex flex-col items-center justify-center p-3 rounded-lg border ${borderColor} ${itemBg} hover:border-red-500/50 hover:shadow-lg transition-all group`}
          >
            <RotateCcw size={18} className={`${iconColor} group-hover:text-red-500 mb-1`} />
            <span className="text-[10px] font-bold opacity-60">Clear</span>
          </button>
        </div>
      </div>

      {/* Export Section */}
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Output Delivery</label>
        <div className="flex flex-col gap-2">
          <button
            onClick={onSaveImage}
            className={`flex items-center gap-3 p-3.5 rounded-lg border ${borderColor} ${itemBg} hover:border-indigo-500/50 hover:shadow-lg transition-all group`}
          >
            <Save size={18} className="text-indigo-500" />
            <span className="text-sm font-bold">Save Annotated Image</span>
          </button>
          <button
            onClick={onExport}
            className={`flex items-center gap-3 p-3.5 rounded-lg border ${borderColor} ${itemBg} hover:border-indigo-500/50 hover:shadow-lg transition-all group`}
          >
            <Download size={18} className={iconColor} />
            <span className="text-sm font-bold">Export JSON Data</span>
          </button>
        </div>
      </div>

      {/* Registry Section */}
      <div className="flex-grow flex flex-col gap-3 min-h-0">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Layer Registry ({closedPolygons.length})</label>
          <div className="p-1 px-2 rounded-full bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-tighter">Verified</div>
        </div>

        <div className="flex-grow overflow-y-auto pr-1 space-y-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {activePolygon && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-lg border-2 border-dashed border-indigo-500/30 ${darkMode ? 'bg-indigo-500/5' : 'bg-indigo-50'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span className="text-xs font-bold text-indigo-500 uppercase">Input Stream Active</span>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 font-bold tabular-nums">POINTS: {activePolygon.points.length}</div>
              </motion.div>
            )}

            {closedPolygons.map((poly, idx) => (
              <motion.div
                layout
                key={poly.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`group p-4 rounded-lg border ${borderColor} ${itemBg} hover:border-indigo-500/40 hover:shadow-md transition-all flex flex-col gap-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="shrink-0 w-3 h-3 rounded-md shadow-sm" style={{ backgroundColor: poly.color }} />
                    <span className="text-[13px] font-bold truncate">{poly.label || `Entity ${idx + 1}`}</span>
                  </div>
                  <button
                    onClick={() => onDelete(poly.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                      <Tractor size={12} className="opacity-50" />
                      {poly.points.length} V
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                      <Maximize2 size={12} className="opacity-50" />
                      {poly.area?.toLocaleString()} PX²
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'} text-[8px] font-black uppercase tracking-[0.1em]`}>Locked</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;


