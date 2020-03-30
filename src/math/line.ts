import Point from './point';

interface ILine {
  p: Point;
  q: Point;
}

class Line implements ILine {
  p: Point;
  q: Point;

  constructor(p: Point, q: Point) {
    if (p.x === q.x && p.y === q.y) {
      throw new Error('p and q must be different points');
    }

    this.p = p;
    this.q = q;
  }

  intersects(l: Line): Point {
    // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
    const x1 = this.p.x;
    const y1 = this.p.y;

    const x2 = this.q.x;
    const y2 = this.q.y;

    const x3 = l.p.x;
    const y3 = l.p.y;

    const x4 = l.q.x;
    const y4 = l.q.y;

    const x =
      ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
      ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    const y =
      ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
      ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    return { x, y };
  }
}

export default Line;
