import { intersect, shape } from 'svg-intersections';
import Point from './point';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function isOverlapping(r1: Box, r2: Box): boolean {
  return (
    ((r1.x < r2.x && r1.x + r1.width >= r2.x) ||
      (r2.x < r1.x && r2.x + r2.width >= r1.x)) &&
    ((r1.y < r2.y && r1.y + r1.height >= r2.y) ||
      (r2.y < r1.y && r2.y + r2.height >= r1.y))
  );
}

export function isIntersectingPath(rect: Box, path: string): boolean {
  const selectRect = shape('rect', {
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
  });
  const arrowPath = shape('path', { d: path });
  const intersection = intersect(selectRect, arrowPath);
  return intersection.points.length !== 0;
}

export function isWithinBounds(x: number, y: number, box: Box): boolean {
  return (
    x >= box.x &&
    x <= box.x + box.width &&
    y >= box.y &&
    y <= box.y + box.height
  );
}

// Return rectangle that surrounds all input `rects`.
export function outline(...rects: Box[]): Box {
  if (rects.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const first = rects[0];
  let [minX, minY] = [first.x, first.y];
  let [maxX, maxY] = [first.x + first.width, first.y + first.height];

  rects.forEach((r) => {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.width);
    maxY = Math.max(maxY, r.y + r.height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

// Find middle of all the boxes.
export function midpoint(boxes: Box[]): Point {
  if (boxes.length === 0) return { x: 0, y: 0 };
  const box = boxes[0];
  let [minX, maxX, minY, maxY] = [
    box.x,
    box.x + box.width,
    box.y,
    box.y + box.height,
  ];
  boxes.forEach((box) => {
    minX = Math.min(minX, box.x);
    maxX = Math.max(maxX, box.x + box.width);
    minY = Math.min(minY, box.y);
    maxY = Math.max(maxY, box.y + box.height);
  });
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
}

export default Box;
