import { useState, useCallback, useMemo, useEffect } from "react";
import { Point, Polygon } from "./types";

const MAX_HISTORY = 50;

export const useAnnotation = (initialImageWidth: number, initialImageHeight: number) => {
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [activePolygonId, setActivePolygonId] = useState<string | null>(null);
  const [history, setHistory] = useState<Polygon[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const saveToHistory = useCallback((currentPolygons: Polygon[]) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(currentPolygons)));
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
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
    setPolygons((prev) => {
      const lastPolygon = prev[prev.length - 1];
      let newPolygons: Polygon[];

      if (!lastPolygon || lastPolygon.isClosed) {
        // Create new polygon
        const newPolygon: Polygon = {
          id: crypto.randomUUID(),
          points: [point],
          isClosed: false,
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        };
        newPolygons = [...prev, newPolygon];
      } else {
        // Add point to active polygon
        newPolygons = prev.map((p, idx) =>
          idx === prev.length - 1 ? { ...p, points: [...p.points, point] } : p
        );
      }
      saveToHistory(newPolygons);
      return newPolygons;
    });
  }, [saveToHistory]);

  const closeActivePolygon = useCallback(() => {
    setPolygons((prev) => {
      const newPolygons = prev.map((p, idx) =>
        idx === prev.length - 1 && p.points.length >= 3 ? { ...p, isClosed: true } : p
      );
      if (JSON.stringify(prev) !== JSON.stringify(newPolygons)) {
        saveToHistory(newPolygons);
      }
      return newPolygons;
    });
  }, [saveToHistory]);

  const deletePolygon = useCallback((id: string) => {
    setPolygons((prev) => {
      const newPolygons = prev.filter((p) => p.id !== id);
      saveToHistory(newPolygons);
      return newPolygons;
    });
  }, [saveToHistory]);

  const reset = useCallback(() => {
    setPolygons([]);
    setHistory([[]]);
    setHistoryIndex(0);
  }, []);

  const updatePoint = useCallback((polygonId: string, pointIndex: number, newPoint: Point) => {
    setPolygons((prev) => {
      const newPolygons = prev.map((p) => {
        if (p.id === polygonId) {
          const newPoints = [...p.points];
          newPoints[pointIndex] = newPoint;
          return { ...p, points: newPoints };
        }
        return p;
      });
      // We don't save to history for every mouse move during drag
      // Only when the drag starts/ends in the UI component
      return newPolygons;
    });
  }, []);

  const exportJSON = useCallback(() => {
    const data = {
      image: "baseball.png",
      timestamp: new Date().toISOString(),
      polygons: polygons.map(p => ({
        id: p.id,
        points: p.points,
        isClosed: p.isClosed
      }))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `annotation-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [polygons]);

  return {
    polygons,
    undo,
    redo,
    addPoint,
    closeActivePolygon,
    deletePolygon,
    reset,
    updatePoint,
    exportJSON,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    saveToHistory
  };
};
