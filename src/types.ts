export interface Point {
  x: number;
  y: number;
}

export interface Polygon {
  id: string;
  points: Point[];
  isClosed: boolean;
  color: string;
  label?: string;
  area?: number;
}

export interface AnnotationState {
  polygons: Polygon[];
  activePolygonId: string | null;
  history: Polygon[][];
  historyIndex: number;
}
