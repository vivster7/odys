import { v4 } from 'uuid';

export type ShapeType = 'rect' | 'text' | 'arrow';

export interface Draggable {
  id: string;
  x: number;
  y: number;
  translateX: number;
  translateY: number;
}

export interface Resizable {
  id: string;
  width: number;
  height: number;
  deltaWidth: number;
  deltaHeight: number;
}

export interface Selectable {
  id: string;
}

export interface TextEditable {
  id: string;
  text: string;
}

// Shape can be drawn inside an SVG.
export default interface Shape {
  id: string;
  type: ShapeType;
}

export const idFn = () => `id-${v4()}`;
