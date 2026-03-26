import React, { useEffect, useMemo } from 'react';
import { useAnnotation } from './useAnnotation';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import baseballImage from './assets/baseball.png';
import { Layers } from 'lucide-react';
import './App.css';

const App: React.FC = () => {
  const {
    polygons,
    undo,
    redo,
    addPoint,
    closeActivePolygon,
    deletePolygon,
    reset,
    updatePoint,
    exportJSON,
    canUndo,
    canRedo,
    saveToHistory
  } = useAnnotation(1200, 800);

  const activePolygon = useMemo(() => {
    const last = polygons[polygons.length - 1];
    return last && !last.isClosed ? last : null;
  }, [polygons]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        redo();
      } else if (e.key === 'Escape') {
        if (activePolygon) {
          deletePolygon(activePolygon.id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, activePolygon, deletePolygon]);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center p-8 overflow-x-hidden">
      {/* Header section */}
      <header className="max-w-6xl w-full flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/20">
            <Layers size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
              Precision Annotation UI
            </h1>
            <p className="text-zinc-500 font-medium">Professional Polygon Tooling System</p>
          </div>
        </div>
        <div className="hidden md:flex gap-6 items-center">
          <div className="text-right">
            <div className="text-sm font-semibold text-zinc-300">Developer Candidate</div>
            <div className="text-xs text-zinc-500">Assignment Submission</div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-white/5 bg-zinc-800/50 p-1 flex items-center justify-center overflow-hidden">
             <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">AP</div>
          </div>
        </div>
      </header>

      {/* Main app grid */}
      <main className="max-w-7xl w-full flex flex-col lg:flex-row gap-10 items-start">
        <Toolbar 
          onReset={reset}
          onExport={exportJSON}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          polygons={polygons}
          activePolygon={activePolygon}
        />

        <div className="flex-grow flex flex-col gap-6 w-full lg:w-auto">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Mode: {activePolygon ? 'Drawing' : 'Ready'}
            </div>
            <div className="text-xs text-zinc-600 font-medium italic">
              *All points are responsive and accurately mapped
            </div>
          </div>
          
          <Canvas 
            imageSrc={baseballImage}
            polygons={polygons}
            onAddPoint={addPoint}
            onClosePolygon={closeActivePolygon}
            onUpdatePoint={(id, idx, pt) => updatePoint(id, idx, pt)}
            onDeletePolygon={deletePolygon}
            onSaveToHistory={saveToHistory}
          />

          <div className="p-6 rounded-2xl bg-zinc-900 shadow-inner border border-white/5 opacity-80 backdrop-grayscale hover:opacity-100 transition-opacity">
            <h3 className="text-sm font-semibold mb-3 text-zinc-400">Current Export Matrix (Live Update)</h3>
            <div className="bg-black/40 rounded-lg p-4 font-mono text-[11px] text-blue-300/80 leading-relaxed overflow-x-auto border border-white/5 max-h-48 custom-scrollbar">
              <pre>
{JSON.stringify({
  image: "baseball.png",
  polygons: polygons.map(p => ({
    id: p.id.substring(0, 8) + '...',
    points: p.points.length,
    closed: p.isClosed
  }))
}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </main>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-1/4 w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[40vw] h-[40vw] bg-indigo-600/20 rounded-full blur-[120px]" />
      </div>

    </div>
  );
};

export default App;
