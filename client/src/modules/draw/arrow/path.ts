import { Shape } from '../shape/shape.reducer';

const EDGE_MARGIN = 5;
const IO_OFFSET = 0; // 10
const THRESHOLD = 100;
const MIN_THRESHOLD = 20;
const BOUNDING_BOX = {
  x: 100,
  y: 150,
  ratio: 1 / 2,
};

export function computeCurve(fromShape: Shape, toShape: Shape) {
  // arrow goes FROM rect1 (r1)  TO rect2 (r)
  const r1 = fromShape;
  const r2 = toShape;

  const r1X = r1.x + r1.translateX;
  const r1Y = r1.y + r1.translateY;
  const r1Height = r1.height + r1.deltaHeight;
  const r1Width = r1.width + r1.deltaWidth;
  const r1XEnd = r1X + r1Width;
  const r1YEnd = r1Y + r1Height;
  const r1XMid = (r1X + r1XEnd) / 2;
  const r1YMid = (r1Y + r1YEnd) / 2;

  const r2X = r2.x + r2.translateX;
  const r2Y = r2.y + r2.translateY;
  const r2Height = r2.height + r2.deltaHeight;
  const r2Width = r2.width + r2.deltaWidth;
  const r2XEnd = r2X + r2Width;
  const r2YEnd = r2Y + r2Height;
  const r2XMid = (r2X + r2XEnd) / 2;
  const r2YMid = (r2Y + r2YEnd) / 2;

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

  const xPos = r2X - r1XEnd;
  const xNeg = r1X - r2XEnd;
  const xDiff = Math.max(xPos, xNeg, 0);
  const yPos = r2Y - r1YEnd;
  const yNeg = r1Y - r2YEnd;
  const yDiff = Math.max(yPos, yNeg, 0);

  let from;
  let to;
  const xyRatio = Math.abs(xDiff) / Math.abs(yDiff);
  if (Math.abs(xDiff) > BOUNDING_BOX.x || Math.abs(yDiff) > BOUNDING_BOX.y) {
    const xyRatio = Math.abs(xDiff) / Math.abs(yDiff);
    if (r2X > r1XEnd && r2YMid > r1Y && r2YMid < r1YEnd) {
      from = 'right';
      to = 'left';
    } else if (r1X > r2XEnd && r2YMid > r1Y && r2YMid < r1YEnd) {
      from = 'left';
      to = 'right';
    } else if (r2Y > r1YEnd && r2XMid > r1X && r2XMid < r1XEnd) {
      from = 'bottom';
      to = 'top';
    } else if (r1Y > r2YEnd && r2XMid > r1X && r2XMid < r1XEnd) {
      from = 'top';
      to = 'bottom';
    } else if (xyRatio > BOUNDING_BOX.ratio) {
      if (xPos > xNeg) {
        from = 'right';
        to = 'left';
      } else {
        from = 'left';
        to = 'right';
      }
    } else {
      if (yPos > yNeg) {
        from = 'bottom';
        to = 'top';
      } else {
        from = 'top';
        to = 'bottom';
      }
    }
  } else {
    if (r2XMid - r1XEnd >= MIN_THRESHOLD) {
      from = 'right';

      if (r2Y - r1YMid > MIN_THRESHOLD) {
        to = 'top';
      } else if (r1YMid - r2YEnd > MIN_THRESHOLD) {
        to = 'bottom';
      } else if (r2X > r1XEnd) {
        to = 'left';
      }
    } else if (r1X - r2XMid > MIN_THRESHOLD) {
      from = 'left';

      if (r2Y - r1YMid > MIN_THRESHOLD) {
        to = 'top';
      } else if (r1YMid - r2YEnd > MIN_THRESHOLD) {
        to = 'bottom';
      } else if (r1X > r2XEnd) {
        to = 'right';
      }
    } else if (r2YMid - r1YEnd >= MIN_THRESHOLD) {
      from = 'bottom';
      if (r2X - r1XMid > MIN_THRESHOLD) {
        to = 'left';
      } else if (r1XMid - r2XEnd > MIN_THRESHOLD) {
        to = 'right';
      } else if (r2Y > r1YEnd) {
        to = 'top';
      }
    } else if (r1Y - r2YMid >= MIN_THRESHOLD) {
      from = 'top';
      if (r2X - r1XMid > MIN_THRESHOLD) {
        to = 'left';
      } else if (r1XMid - r2XEnd > MIN_THRESHOLD) {
        to = 'right';
      } else if (r1Y > r2YEnd) {
        to = 'bottom';
      }
    }
  }

  if (from && to) {
    if (from === 'left') {
      x1 = r1X - EDGE_MARGIN;
      y1 = r1YMid + IO_OFFSET;
    } else if (from === 'right') {
      x1 = r1XEnd + EDGE_MARGIN;
      y1 = r1YMid - IO_OFFSET;
    } else if (from === 'top') {
      x1 = r1XMid + IO_OFFSET;
      y1 = r1Y - EDGE_MARGIN;
    } else {
      x1 = r1XMid + IO_OFFSET;
      y1 = r1YEnd + EDGE_MARGIN;
    }

    if (to === 'left') {
      x2 = r2X - EDGE_MARGIN;
      y2 = r2YMid;
    } else if (to === 'right') {
      x2 = r2XEnd + EDGE_MARGIN;
      y2 = r2YMid;
    } else if (to === 'top') {
      x2 = r2XMid;
      y2 = r2Y - EDGE_MARGIN;
    } else {
      x2 = r2XMid;
      y2 = r2YEnd + EDGE_MARGIN;
    }

    if (['top', 'bottom'].includes(from)) {
      if (['left', 'right'].includes(to)) {
        path = `M ${x1} ${y1} C ${x1} ${y2} ${x1} ${y2}, ${x2} ${y2}`;
      } else if (['top', 'bottom'].includes(to)) {
        path = `M ${x1} ${y1} C ${x1} ${y2} ${x2} ${y1}, ${x2} ${y2}`;
      }
    } else if (['left', 'right'].includes(from)) {
      if (['left', 'right'].includes(to)) {
        path = `M ${x1} ${y1} C ${x2} ${y1} ${x1} ${y2}, ${x2} ${y2}`;
      } else if (['top', 'bottom'].includes(to)) {
        path = `M ${x1} ${y1} C ${x2} ${y1} ${x2} ${y1}, ${x2} ${y2}`;
      }
    }
  }

  return {
    path,
    // x1,
    // x2,
    // y1,
    // y2,
  };
}
