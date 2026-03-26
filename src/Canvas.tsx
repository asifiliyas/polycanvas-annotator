import React, { useRef, useState, useCallback, useMemo } from 'react';
import { Polygon, Point } from './types';
import { Trash2, GripVertical } from 'lucide-react';

interface CanvasProps {
  imageSrc: string;
  polygons: Polygon[];
  onAddPoint: (point: Point) => void;
  onClosePolygon: () => void;
  onUpdatePoint: (polygonId: string, pointIndex: number, newPoint: Point) => void;
  onDeletePolygon: (id: string) => void;
  onSaveToHistory: (polygons: Polygon[]) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  imageSrc,
  polygons,
  onAddPoint,
  onClosePolygon,
  onUpdatePoint,
  onDeletePolygon,
  onSaveToHistory,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ polygonId: string; pointIndex: number } | null>(null);
  const [draggingPoint, setDraggingPoint] = useState<{ polygonId: string; pointIndex: number } | null>(null);
  const [hoveringFirstPoint, setHoveringFirstPoint] = useState(false);

  const activePolygon = useMemo(() => {
    const last = polygons[polygons.length - 1];
    return last && !last.isClosed ? last : null;
  }, [polygons]);

  const snapDistance = 15;

  const getCoordinates = (e: React.MouseEvent | MouseEvent): Point | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (draggingPoint) return;
    
    const coord = getCoordinates(e);
    if (!coord) return;

    if (activePolygon && activePolygon.points.length >= 3) {
      const firstPoint = activePolygon.points[0];
      const dist = Math.sqrt(
        Math.pow(coord.x - firstPoint.x, 2) + Math.pow(coord.y - firstPoint.y, 2)
      );
      if (dist < snapDistance) {
        onClosePolygon();
        return;
      }
    }

    if (!activePolygon || !activePolygon.isClosed) {
      onAddPoint(coord);
    }
  }, [activePolygon, onAddPoint, onClosePolygon]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const coord = getCoordinates(e);
    if (!coord) return;

    if (draggingPoint) {
      onUpdatePoint(draggingPoint.polygonId, draggingPoint.pointIndex, coord);
      return;
    }

    if (activePolygon && activePolygon.points.length >= 3) {
      const firstPoint = activePolygon.points[0];
      const dist = Math.sqrt(
        Math.pow(coord.x - firstPoint.x, 2) + Math.pow(coord.y - firstPoint.y, 2)
      );
      setHoveringFirstPoint(dist < snapDistance);
    } else {
      setHoveringFirstPoint(false);
    }
  }, [activePolygon, draggingPoint, onUpdatePoint]);

  const handleMouseUp = useCallback(() => {
    if (draggingPoint) {
      onSaveToHistory(polygons); // Record state into history AFTER drag ends
      setDraggingPoint(null);
    }
  }, [draggingPoint, polygons, onSaveToHistory]);

  const handlePointMouseDown = useCallback((e: React.MouseEvent, polygonId: string, pointIndex: number) => {
    e.stopPropagation();
    setDraggingPoint({ polygonId, pointIndex });
  }, []);

  return (
    <div 
      className="relative flex items-center justify-center p-8 bg-zinc-950/20 backdrop-blur rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 overflow-hidden"
      style={{ minHeight: '600px' }}
    >
      <div 
        ref={containerRef}
        className="relative group select-none cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img 
          src={imageSrc} 
          alt="Tool" 
          className="rounded-lg shadow-lg pointer-events-none max-w-full block transition-transform duration-500 hover:scale-[1.005]"
          draggable={false}
        />
        
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        >
          {polygons.map((poly) => {
            const pointsString = poly.points.map(p => `${p.x},${p.y}`).join(' ');
            return (
              <g key={poly.id} className="pointer-events-auto">
                {/* Connection lines */}
                {poly.isClosed ? (
                  <polygon
                    points={pointsString}
                    fill={poly.color + '33'}
                    stroke={poly.color}
                    strokeWidth="3"
                    className="transition-all duration-200 hover:stroke-white group-hover:drop-shadow-lg"
                  />
                ) : (
                  <polyline
                    points={pointsString}
                    fill="none"
                    stroke={poly.color}
                    strokeWidth="3"
                    className="drop-shadow-md"
                  />
                )}

                {/* Circles for vertices */}
                {poly.points.map((p, idx) => {
                  const isFirstPoint = idx === 0 && !poly.isClosed;
                  const isHovered = hoveringFirstPoint && isFirstPoint;
                  
                  return (
                    <circle
                      key={`${poly.id}-${idx}`}
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 8 : 5}
                      fill={isHovered ? '#fff' : poly.color}
                      stroke="white"
                      strokeWidth="2"
                      className={`cursor-grab active:cursor-grabbing transition-transform duration-200 ${isHovered ? 'scale-125' : ''}`}
                      onMouseDown={(e) => handlePointMouseDown(e, poly.id, idx)}
                      onMouseEnter={() => setHoveredPoint({ polygonId: poly.id, pointIndex: idx })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Floating Controls for closed polygons */}
        {polygons.filter(p => p.isClosed).map(p => {
          const center = p.points.reduce((acc, pt) => ({ x: acc.x + pt.x / p.points.length, y: acc.y + pt.y / p.points.length }), { x: 0, y: 0 });
          return (
            <div 
              key={`ctrl-${p.id}`}
              className="absolute group/ctrl pointer-events-auto"
              style={{ left: center.x, top: center.y, transform: 'translate(-50%, -50%)' }}
            >
              <button 
                onClick={() => onDeletePolygon(p.id)}
                className="opacity-0 group-hover:opacity-100 p-2 bg-red-500/90 text-white rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                title="Delete Polygon"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default Canvas;
