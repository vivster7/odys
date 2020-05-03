import Point from './point';

interface Line {
  p: Point;
  q: Point;
}

// https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
export function intersects(l1: Line, l2: Line): Point {
  const x1 = l1.p.x;
  const y1 = l1.p.y;

  const x2 = l1.q.x;
  const y2 = l1.q.y;

  const x3 = l2.p.x;
  const y3 = l2.p.y;

  const x4 = l2.q.x;
  const y4 = l2.q.y;

  const x =
    ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
    ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
  const y =
    ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
    ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
  return { x, y };
}

export default Line;
