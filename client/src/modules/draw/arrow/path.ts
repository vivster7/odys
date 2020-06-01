import { Shape } from '../shape/shape.reducer';

const EDGE_OFFSET = 5;
const IO_OFFSET = 10;

export function computeCurve(fromShape: Shape, toShape: Shape) {
  // arrow goes FROM rect1 (r1)  TO rect2 (r)
  const r1 = fromShape;
  const r2 = toShape;

  const r1X = r1.x + r1.translateX;
  const r1Y = r1.y + r1.translateY;
  const r1Height = r1.height + r1.deltaHeight;
  const r1Width = r1.width + r1.deltaWidth;
  const r1XEdge = r1X + r1Width;
  const r1YEdge = r1Y + r1Height;
  const r1XMid = (r1X + r1XEdge) / 2;
  const r1YMid = (r1Y + r1YEdge) / 2;

  const r2X = r2.x + r2.translateX;
  const r2Y = r2.y + r2.translateY;
  const r2Height = r2.height + r2.deltaHeight;
  const r2Width = r2.width + r2.deltaWidth;
  const r2XEdge = r2X + r2Width;
  const r2YEdge = r2Y + r2Height;
  const r2XMid = (r2X + r2XEdge) / 2;
  const r2YMid = (r2Y + r2YEdge) / 2;

  let path;
  const controlPointOffset = (start: number, end: number) => (end - start) / 2;

  let x1: number;
  let x2: number;
  let y1: number;
  let y2: number;
  /**
    if x-diff is greater than y-diff, so draw arrows primarily along x-axis as the anchor
    else draw arrows primarily along y-axis as the anchor
  */
  if (Math.abs(r2XMid - r1XMid) > Math.abs(r2YMid - r1YMid)) {
    /**
      if r1-x position is greater than r2-x position, then arrow is traveling in the negative-x direction (left),
      else arrow is traveling in the positive x-direction (right)
    */

    if (r1XMid > r2XMid) {
      const cp = controlPointOffset(r2XEdge, r1X);
      x1 = r1X - EDGE_OFFSET;
      x2 = r2XEdge + EDGE_OFFSET;
      y1 = r1YMid + IO_OFFSET;
      y2 = r2YMid + IO_OFFSET;

      path = `M ${x1} ${y1} C ${x1 - cp} ${y1} ${x2 + cp} ${y2}, ${x2} ${y2}`;
    } else {
      const cp = controlPointOffset(r1XEdge, r2X);
      x1 = r1XEdge + EDGE_OFFSET;
      x2 = r2X - EDGE_OFFSET;
      y1 = r1YMid - IO_OFFSET;
      y2 = r2YMid - IO_OFFSET;

      path = `M ${x1} ${y1} C ${x1 + cp} ${y1} ${x2 - cp} ${y2}, ${x2} ${y2}`;
    }
  } else {
    /**
      if r1-y position is greater than r2-y position, then arrow is traveling in the negative-y direction (up),
      else arrow is traveling in the positive y-direction (down)
    */

    if (r1YMid > r2YMid) {
      const cp = controlPointOffset(r2YEdge, r1Y);
      y1 = r1Y - EDGE_OFFSET;
      y2 = r2YEdge + EDGE_OFFSET;
      x1 = r1XMid - IO_OFFSET;
      x2 = r2XMid - IO_OFFSET;

      path = `M ${x1} ${y1} C ${x1} ${y1 - cp} ${x2} ${y2 + cp}, ${x2} ${y2}`;
    } else {
      const cp = controlPointOffset(r1YEdge, r2Y);
      y1 = r1YEdge + EDGE_OFFSET;
      y2 = r2Y - EDGE_OFFSET;
      x1 = r1XMid + IO_OFFSET;
      x2 = r2XMid + IO_OFFSET;

      path = `M ${x1} ${y1} C ${x1} ${y1 + cp} ${x2} ${y2 - cp}, ${x2} ${y2}`;
    }
  }

  return {
    path,
    x1,
    x2,
    y1,
    y2,
  };
}
