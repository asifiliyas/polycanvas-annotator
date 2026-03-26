import React, { useEffect, useMemo, useState } from 'react';
import { useAnnotation } from './useAnnotation';
import Toolbar from './Toolbar';
import Canvas from './Canvas';
import defaultBaseball from './assets/baseball.png';
import { Box, Code, Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const App: React.FC = () => {
  const {
    polygons,
    imageSrc,
    rotation,
    undo,
    redo,
    addPoint,
    closeActivePolygon,
    deletePolygon,
    updateLabel,
    rotate,
    reset,
    updatePoint,
    exportJSON,
    saveAnnotatedImage,
    handleImageUpload,
    canUndo,
    canRedo,
    saveToHistory
  } = useAnnotation();

  const [darkMode, setDarkMode] = useState(true);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activePolygon = useMemo(() => {
    const last = polygons[polygons.length - 1];
    return last && !last.isClosed ? last : null;
  }, [polygons]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      } 
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        redo();
      } 
      else if (e.key === 'Escape') {
        if (activePolygon) deletePolygon(activePolygon.id);
      }
      else if (e.key === 'Enter') {
        if (activePolygon && activePolygon.points.length >= 3) closeActivePolygon();
      }
      else if (e.key === 'r' && !(e.ctrlKey || e.metaKey)) {
        rotate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, activePolygon, deletePolygon, closeActivePolygon, rotate]);

  const bgColor = darkMode ? 'bg-[#0f1115]' : 'bg-[#f8fafc]';
  const textColor = darkMode ? 'text-slate-200' : 'text-slate-800';
  const borderColor = darkMode ? 'border-slate-800' : 'border-slate-200';
  const headerBg = darkMode ? 'bg-[#16191f]/80' : 'bg-white/80';

  return (
    <div className={`h-screen ${bgColor} ${textColor} flex flex-col overflow-hidden transition-colors duration-300 font-sans`}>
      {/* Dynamic Background Accents */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] ${darkMode ? 'bg-indigo-500/10' : 'bg-indigo-500/5'} rounded-full blur-[120px]`} />
        <div className={`absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] ${darkMode ? 'bg-slate-500/10' : 'bg-slate-500/5'} rounded-full blur-[120px]`} />
      </div>

      {/* Modern Header */}
      <header className={`h-22 shrink-0 border-b ${borderColor} ${headerBg} backdrop-blur-xl flex items-center justify-between px-6 md:px-8 z-[60]`}>
        <div className="flex items-center gap-4 md:gap-6">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-500/10 transition-colors"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-10 md:h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
              <Box size={28} className="text-white" />
            </div>
            <div className="flex flex-col justify-center -space-y-1.5">
              <h1 className="font-black text-lg md:text-xl tracking-tighter leading-8 sm:leading-10">POLYCANVAS</h1>
              <span className="text-[11px] md:text-xs font-black text-indigo-500 uppercase tracking-[0.4em] leading-none">Annotator</span>
            </div>
          </div>
          
          <div className={`hidden md:block h-10 w-px ${borderColor}`} />
          
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`relative h-10 w-10 rounded-full border ${borderColor} ${darkMode ? 'bg-slate-900' : 'bg-white'} hover:shadow-lg transition-all flex items-center justify-center overflow-hidden group`}
              aria-label="Toggle View Mode"
            >
              <div className="relative w-6 h-6 flex items-center justify-center">
                <motion.div
                  animate={{ scale: darkMode ? 0.5 : 1, opacity: darkMode ? 0 : 1, rotate: darkMode ? 90 : 0 }}
                  className="absolute w-5 h-5 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.4)]"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: darkMode ? 1 : 0, scale: darkMode ? 1 : 0.5, rotate: darkMode ? 0 : -90 }}
                  className="absolute w-5 h-5 bg-indigo-400 rounded-full"
                >
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${darkMode ? 'bg-slate-900' : 'bg-white'} transition-colors duration-300`} />
                </motion.div>
                {!darkMode && [0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                  <motion.div
                    key={angle}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute w-0.5 h-1.5 bg-yellow-400 rounded-full"
                    style={{ transform: `rotate(${angle}deg) translateY(-8px)` }}
                  />
                ))}
              </div>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`md:hidden p-2.5 rounded-full border ${borderColor} hover:bg-slate-500/10`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-500/10 border border-slate-500/20 flex items-center justify-center font-bold text-indigo-500 shrink-0 shadow-inner">
            AI
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-grow flex flex-col md:flex-row min-h-0 relative z-10 overflow-hidden">
        {/* Sidebar Overlay on Mobile */}
        <AnimatePresence>
          {(isSidebarOpen) && (
            <motion.div
              key="mobile-sidebar"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 z-[70] h-full overflow-y-auto"
            >
              <Toolbar 
                darkMode={darkMode}
                onReset={reset}
                onExport={exportJSON}
                onSaveImage={saveAnnotatedImage}
                onUndo={undo}
                onRedo={redo}
                onUpload={handleImageUpload}
                onDelete={deletePolygon}
                onRotate={rotate}
                canUndo={canUndo}
                canRedo={canRedo}
                polygons={polygons}
                activePolygon={activePolygon}
                onCloseMobile={() => setIsSidebarOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <div className="hidden md:block h-full shrink-0">
          <Toolbar 
            darkMode={darkMode}
            onReset={reset}
            onExport={exportJSON}
            onSaveImage={saveAnnotatedImage}
            onUndo={undo}
            onRedo={redo}
            onUpload={handleImageUpload}
            onDelete={deletePolygon}
            onRotate={rotate}
            canUndo={canUndo}
            canRedo={canRedo}
            polygons={polygons}
            activePolygon={activePolygon}
          />
        </div>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[65] md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-grow flex flex-col relative overflow-hidden bg-transparent">
          <div className="flex-grow flex items-center justify-center px-4 md:px-8 relative">
            <Canvas 
              imageSrc={imageSrc || defaultBaseball}
              rotation={rotation}
              polygons={polygons}
              onAddPoint={addPoint}
              onClosePolygon={closeActivePolygon}
              onUpdatePoint={updatePoint}
              onDeletePolygon={deletePolygon}
              onUpdateLabel={updateLabel}
              onSaveToHistory={saveToHistory}
            />
          </div>

          {/* Minimal Dev Toggle */}
          <div className="absolute bottom-1 right-2 md:bottom-8 md:right-8 flex flex-col gap-3">
            <AnimatePresence>
              {showDevPanel && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className={`w-72 p-4 rounded-lg border ${borderColor} ${darkMode ? 'bg-slate-900/90' : 'bg-white/90'} backdrop-blur-xl shadow-2xl mb-2`}
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Raw Data Stream</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <pre className={`text-[10px] font-mono leading-relaxed overflow-x-auto custom-scrollbar ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    {JSON.stringify({ objects: polygons.length, rot: rotation }, null, 2)}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
            <button 
              onClick={() => setShowDevPanel(!showDevPanel)}
              className={`ml-auto p-1  sm:p-3 rounded-lg border ${borderColor} ${darkMode ? 'bg-slate-900' : 'bg-white'} hover:shadow-xl transition-all ${textColor}`}
            >
              <Code size={18} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
