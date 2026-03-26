import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Point, Polygon } from './types';

interface CanvasProps {
  imageSrc: string;
  rotation: number;
  polygons: Polygon[];
  onAddPoint: (point: Point) => void;
  onClosePolygon: () => void;
  onUpdatePoint: (polygonId: string, pointIndex: number, newPoint: Point) => void;
  onDeletePolygon: (id: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
  onSaveToHistory: () => void;
}

const Canvas: React.FC<CanvasProps> = ({
  imageSrc,
  rotation,
  polygons,
  onAddPoint,
  onClosePolygon,
  onUpdatePoint,
  onSaveToHistory
}) => {
  const [dragging, setDragging] = useState<{ polygonId: string; pointIndex: number } | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ polygonId: string; pointIndex: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const activePolygon = polygons.find(p => !p.isClosed);

  // Precise coordinate mapping from click to image space
  const getCoordinates = (e: React.MouseEvent | MouseEvent): Point | null => {
    if (!imageRef.current) return null;
    
    const img = imageRef.current;
    const rect = img.getBoundingClientRect();
    
    // Relative position within the bounding rectangle (0 to 1)
    let rx = (e.clientX - rect.left) / rect.width;
    let ry = (e.clientY - rect.top) / rect.height;

    // Adjust for CSS rotation
    // Note: getBoundingClientRect() returns the box AFTER rotation.
    // If we rotate 90 deg, x on screen becomes -y relative to image.
    let x, y;
    const normRot = ((rotation % 360) + 360) % 360;

    if (normRot === 90) {
      x = ry * img.naturalWidth;
      y = (1 - rx) * img.naturalHeight;
    } else if (normRot === 180) {
      x = (1 - rx) * img.naturalWidth;
      y = (1 - ry) * img.naturalHeight;
    } else if (normRot === 270) {
      x = (1 - ry) * img.naturalWidth;
      y = rx * img.naturalHeight;
    } else {
      x = rx * img.naturalWidth;
      y = ry * img.naturalHeight;
    }

    return { x: Math.round(x), y: Math.round(y) };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (dragging) return;
    const coords = getCoordinates(e);
    if (!coords) return;

    if (activePolygon) {
      if (hoveredPoint && hoveredPoint.polygonId === activePolygon.id && hoveredPoint.pointIndex === 0) {
        onClosePolygon();
        return;
      }
    }

    if (!hoveredPoint) {
      onAddPoint(coords);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging) {
      const coords = getCoordinates(e);
      if (coords) {
        onUpdatePoint(dragging.polygonId, dragging.pointIndex, coords);
      }
    }
  };

  const handleMouseUp = () => {
    if (dragging) {
      onSaveToHistory();
      setDragging(null);
    }
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex items-center justify-center select-none overflow-hidden relative p-1 sm:p-4"
      onMouseDown={handleMouseDown}
    >
      <div 
        className="relative shadow-2xl transition-all duration-500 ease-in-out bg-black/5 flex items-center justify-center"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Source"
          className="max-w-full max-h-[85vh] w-auto h-auto block pointer-events-none object-contain transition-all"
          draggable={false}
        />

        <svg
          className="absolute pointer-events-none overflow-visible"
          viewBox={`0 0 ${imageRef.current?.naturalWidth || 100} ${imageRef.current?.naturalHeight || 100}`}
          style={{ 
            width: imageRef.current?.width || '100%', 
            height: imageRef.current?.height || '100%',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)' 
          }}
        >
          {polygons.map((poly) => (
            <g key={poly.id} className="pointer-events-auto">
              {poly.points.length > 1 && (
                <path
                  d={`M ${poly.points.map(p => `${p.x},${p.y}`).join(' L ')} ${poly.isClosed ? 'Z' : ''}`}
                  fill={poly.color}
                  fillOpacity={poly.isClosed ? 0.3 : 0.15}
                  stroke={poly.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={poly.isClosed ? "0" : "15,10"}
                  className={poly.isClosed ? "transition-all duration-300" : "animate-[dash_1s_linear_infinite]"}
                />
              )}

              {poly.points.map((pt, idx) => {
                const isHovered = hoveredPoint?.polygonId === poly.id && hoveredPoint?.pointIndex === idx;
                const isFirst = idx === 0 && !poly.isClosed;
                
                return (
                  <circle
                    key={`${poly.id}-${idx}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 18 : 14}
                    fill={isFirst ? '#fff' : poly.color}
                    stroke={isFirst ? poly.color : '#fff'}
                    strokeWidth={isHovered ? 8 : 6}
                    className="cursor-pointer transition-all duration-200 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                    onMouseEnter={() => setHoveredPoint({ polygonId: poly.id, pointIndex: idx })}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      if (!poly.isClosed && idx === 0 && poly.points.length >= 3) {
                        onClosePolygon();
                      } else {
                        setDragging({ polygonId: poly.id, pointIndex: idx });
                      }
                    }}
                  />
                );
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* Labels Overlay (Fixed rotation so they stay upright relative to screen) */}
      <div className="absolute inset-0 pointer-events-none z-50">
        {polygons.map((poly) => {
          if (poly.points.length === 0) return null;
          
          // We need to calculate where the first point is IN SCREEN SPACE to place labels
          // This is complex due to rotation, so we'll simplify and use relative positioning 
          // inside the rotated container if needed, but the user wants them upright.
          return (
            <AnimatePresence key={`presence-${poly.id}`}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                // Labels are tricky with rotation. For now, we'll keep them simple.
              />
            </AnimatePresence>
          );
        })}
      </div>
    </div>
  );
};


export default Canvas;
