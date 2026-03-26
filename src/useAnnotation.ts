import { useState, useCallback, useEffect } from "react";
import type { Point, Polygon } from "./types";

const MAX_HISTORY = 50;
const STORAGE_KEY = 'annotation_app_data';

const calculateArea = (points: Point[]) => {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
};

const playSuccessSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); // C6

    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.4);
  } catch (e) {
    console.warn("Audio feedback failed", e);
  }
};

export const useAnnotation = () => {
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [history, setHistory] = useState<Polygon[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { polygons: savedPolys, imageSrc: savedImg, rotation: savedRot } = JSON.parse(saved);
        if (savedPolys) {
          setPolygons(savedPolys);
          setHistory([savedPolys]);
          setHistoryIndex(0);
        }
        if (savedImg) setImageSrc(savedImg);
        if (savedRot !== undefined) setRotation(savedRot);
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ polygons, imageSrc, rotation }));
  }, [polygons, imageSrc, rotation]);

  const updateStateAndHistory = useCallback((newPolygons: Polygon[]) => {
    setPolygons(newPolygons);
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newPolygons)));
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex((prev) => (prev < MAX_HISTORY - 1 ? prev + 1 : prev));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevPolygons = history[historyIndex - 1];
      setPolygons(prevPolygons);
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextPolygons = history[historyIndex + 1];
      setPolygons(nextPolygons);
      setHistoryIndex(historyIndex + 1);
    }
  }, [historyIndex, history]);

  const addPoint = useCallback((point: Point) => {
    const lastPolygon = polygons[polygons.length - 1];
    let newPolygons: Polygon[];

    if (!lastPolygon || lastPolygon.isClosed) {
      const newPolygon: Polygon = {
        id: crypto.randomUUID(),
        points: [point],
        isClosed: false,
        color: `hsl(${Math.random() * 360}, 75%, 55%)`,
        label: `Object ${polygons.length + 1}`
      };
      newPolygons = [...polygons, newPolygon];
    } else {
      newPolygons = polygons.map((p, idx) =>
        idx === polygons.length - 1 ? { ...p, points: [...p.points, point] } : p
      );
    }
    updateStateAndHistory(newPolygons);
  }, [polygons, updateStateAndHistory]);

  const closeActivePolygon = useCallback(() => {
    const active = polygons[polygons.length - 1];
    if (!active || active.isClosed || active.points.length < 3) return;
    
    const newPolygons = polygons.map((p, idx) =>
      idx === polygons.length - 1 ? { 
        ...p, 
        isClosed: true, 
        area: calculateArea(p.points) 
      } : p
    );
    updateStateAndHistory(newPolygons);
    playSuccessSound();
  }, [polygons, updateStateAndHistory]);

  const deletePolygon = useCallback((id: string) => {
    const newPolygons = polygons.filter((p) => p.id !== id);
    updateStateAndHistory(newPolygons);
  }, [polygons, updateStateAndHistory]);

  const updateLabel = useCallback((id: string, label: string) => {
    const newPolygons = polygons.map(p => p.id === id ? { ...p, label } : p);
    updateStateAndHistory(newPolygons);
  }, [polygons, updateStateAndHistory]);

  const rotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const reset = useCallback(() => {
    setPolygons([]);
    setHistory([[]]);
    setHistoryIndex(0);
    setRotation(0);
  }, []);

  const updatePoint = useCallback((polygonId: string, pointIndex: number, newPoint: Point) => {
    setPolygons((prev) => prev.map((p) => {
      if (p.id === polygonId) {
        const newPoints = [...p.points];
        newPoints[pointIndex] = newPoint;
        return { ...p, points: newPoints, area: p.isClosed ? calculateArea(newPoints) : p.area };
      }
      return p;
    }));
  }, []);

  const saveOnDragEnd = useCallback(() => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(polygons)));
      if (newHistory.length > MAX_HISTORY) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex((prev) => (prev < MAX_HISTORY - 1 ? prev + 1 : prev));
  }, [polygons, historyIndex]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageSrc(result);
      reset();
    };
    reader.readAsDataURL(file);
  };

  const exportJSON = useCallback(() => {
    const data = {
      image_source: imageSrc ? "user_upload" : "default_static",
      export_time: new Date().toISOString(),
      viewport_rotation: rotation,
      data: polygons.map(p => ({
        id: p.id,
        label: p.label,
        points: p.points,
        area_px: p.area,
        is_closed: p.isClosed
      }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `annotation-data.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [polygons, imageSrc, rotation]);

  const saveAnnotatedImage = useCallback(async () => {
    if (!imageSrc) return;
    
    const img = new Image();
    img.src = imageSrc;
    await new Promise(r => img.onload = r);

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw rotated image
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    // Draw polygons
    polygons.forEach(poly => {
      if (poly.points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(poly.points[0].x, poly.points[0].y);
      poly.points.slice(1).forEach(pt => ctx.lineTo(pt.x, pt.y));
      
      if (poly.isClosed) {
        ctx.closePath();
        ctx.fillStyle = poly.color.replace('hsl', 'hsla').replace(')', ', 0.3)');
        ctx.fill();
      }

      ctx.strokeStyle = poly.color;
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();

      // Draw vertices
      poly.points.forEach(pt => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = poly.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });

    const link = document.createElement('a');
    link.download = 'annotated-image-pro.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [imageSrc, rotation, polygons]);

  return {
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
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    saveToHistory: saveOnDragEnd
  };
};


