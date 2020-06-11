import { Shape } from '../shape/shape.reducer';

const EDGE_MARGIN = 5;
const MIN_THRESHOLD = 20;
const BOUNDING_BOX = {
  x: 100,
  y: 150,
  ratio: 1 / 2,
};

export interface ShapeValues {
  x: number;
  y: number;
  xEnd: number;
  yEnd: number;
  xMid: number;
  yMid: number;
  height: number;
  width: number;
}

export type Orientation = 'top' | 'left' | 'bottom' | 'right';

export function horizontalOrientation(o: Orientation) {
  return o === 'left' || o === 'right';
}

export function verticalOrientation(o: Orientation) {
  return o === 'top' || o === 'bottom';
}

export function getShapeValues(shape: Shape): ShapeValues {
  const x = shape.x;
  const y = shape.y;
  const height = shape.height;
  const width = shape.width;
  const xEnd = x + width;
  const yEnd = y + height;
  const xMid = (x + xEnd) / 2;
  const yMid = (y + yEnd) / 2;

  return {
    x,
    y,
    xEnd,
    yEnd,
    xMid,
    yMid,
    height,
    width,
  };
}

function getOffset(length: number, count: number, index: number) {
  // set min values to account for ghosts
  return (length / Math.max(2, count)) * Math.max(1, index + 1);
}

export function computeOrientation(
  fromShape: Shape,
  toShape: Shape
): { from: Orientation; to: Orientation } {
  // arrow goes FROM rect1 (r1)  TO rect2 (r)
  const r1 = getShapeValues(fromShape);
  const r2 = getShapeValues(toShape);

  const xPos = r2.x - r1.xEnd;
  const xNeg = r1.x - r2.xEnd;
  const xDiff = Math.max(xPos, xNeg, 0);
  const yPos = r2.y - r1.yEnd;
  const yNeg = r1.y - r2.yEnd;
  const yDiff = Math.max(yPos, yNeg, 0);

  let from: Orientation = 'right';
  let to: Orientation = 'left';
  if (Math.abs(xDiff) > BOUNDING_BOX.x || Math.abs(yDiff) > BOUNDING_BOX.y) {
    const xyRatio = Math.abs(xDiff) / Math.abs(yDiff);
    if (r2.x > r1.xEnd && r2.yMid > r1.y && r2.yMid < r1.yEnd) {
      from = 'right';
      to = 'left';
    } else if (r1.x > r2.xEnd && r2.yMid > r1.y && r2.yMid < r1.yEnd) {
      from = 'left';
      to = 'right';
    } else if (r2.y > r1.yEnd && r2.xMid > r1.x && r2.xMid < r1.xEnd) {
      from = 'bottom';
      to = 'top';
    } else if (r1.y > r2.yEnd && r2.xMid > r1.x && r2.xMid < r1.xEnd) {
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
    if (r2.xMid - r1.xEnd >= MIN_THRESHOLD) {
      from = 'right';

      if (r2.y - r1.yMid > MIN_THRESHOLD) {
        to = 'top';
      } else if (r1.yMid - r2.yEnd > MIN_THRESHOLD) {
        to = 'bottom';
      } else if (r2.x > r1.xEnd) {
        to = 'left';
      }
    } else if (r1.x - r2.xMid > MIN_THRESHOLD) {
      from = 'left';

      if (r2.y - r1.yMid > MIN_THRESHOLD) {
        to = 'top';
      } else if (r1.yMid - r2.yEnd > MIN_THRESHOLD) {
        to = 'bottom';
      } else if (r1.x > r2.xEnd) {
        to = 'right';
      }
    } else if (r2.yMid - r1.yEnd >= MIN_THRESHOLD) {
      from = 'bottom';
      if (r2.x - r1.xMid > MIN_THRESHOLD) {
        to = 'left';
      } else if (r1.xMid - r2.xEnd > MIN_THRESHOLD) {
        to = 'right';
      } else if (r2.y > r1.yEnd) {
        to = 'top';
      }
    } else if (r1.y - r2.yMid >= MIN_THRESHOLD) {
      from = 'top';
      if (r2.x - r1.xMid > MIN_THRESHOLD) {
        to = 'left';
      } else if (r1.xMid - r2.xEnd > MIN_THRESHOLD) {
        to = 'right';
      } else if (r1.y > r2.yEnd) {
        to = 'bottom';
      }
    }
  }

  return { from, to };
}

export function computeCurve(
  id: string,
  fromShape: Shape,
  toShape: Shape,
  fromShapeArrows: string[],
  toShapeArrows: string[]
) {
  // arrow goes FROM rect1 (r1)  TO rect2 (r)
  const r1 = getShapeValues(fromShape);
  const r2 = getShapeValues(toShape);

  let path;
  let x1: number;
  let x2: number;
  let y1: number;
  let y2: number;

  const { from, to } = computeOrientation(fromShape, toShape);

  const _fromShapeArrows = fromShapeArrows ?? [];
  const fromShapeCount = _fromShapeArrows.length + 1;
  const fromShapeIndex = _fromShapeArrows.findIndex(
    (arrowId) => arrowId === id
  );

  if (from === 'left') {
    x1 = r1.x - EDGE_MARGIN;
    y1 = r1.y + getOffset(r1.height, fromShapeCount, fromShapeIndex);
  } else if (from === 'right') {
    x1 = r1.xEnd + EDGE_MARGIN;
    y1 = r1.y + getOffset(r1.height, fromShapeCount, fromShapeIndex);
  } else if (from === 'top') {
    x1 = r1.x + getOffset(r1.width, fromShapeCount, fromShapeIndex);
    y1 = r1.y - EDGE_MARGIN;
  } else {
    x1 = r1.x + getOffset(r1.width, fromShapeCount, fromShapeIndex);
    y1 = r1.yEnd + EDGE_MARGIN;
  }

  const _toShapeArrows = toShapeArrows ?? [];
  const toShapeCount = _toShapeArrows.length + 1;
  const toShapeIndex = _toShapeArrows.findIndex((arrowId) => arrowId === id);

  if (to === 'left') {
    x2 = r2.x - EDGE_MARGIN;
    y2 = r2.y + getOffset(r2.height, toShapeCount, toShapeIndex);
  } else if (to === 'right') {
    x2 = r2.xEnd + EDGE_MARGIN;
    y2 = r2.y + getOffset(r2.height, toShapeCount, toShapeIndex);
  } else if (to === 'top') {
    x2 = r2.x + getOffset(r2.width, toShapeCount, toShapeIndex);
    y2 = r2.y - EDGE_MARGIN;
  } else {
    x2 = r2.x + getOffset(r2.width, toShapeCount, toShapeIndex);
    y2 = r2.yEnd + EDGE_MARGIN;
  }

  if (verticalOrientation(from)) {
    if (horizontalOrientation(to)) {
      path = `M ${x1} ${y1} C ${x1} ${y2} ${x1} ${y2}, ${x2} ${y2}`;
    } else if (verticalOrientation(to)) {
      path = `M ${x1} ${y1} C ${x1} ${y2} ${x2} ${y1}, ${x2} ${y2}`;
    }
  } else if (horizontalOrientation(from)) {
    if (horizontalOrientation(to)) {
      path = `M ${x1} ${y1} C ${x2} ${y1} ${x1} ${y2}, ${x2} ${y2}`;
    } else if (verticalOrientation(to)) {
      path = `M ${x1} ${y1} C ${x2} ${y1} ${x2} ${y1}, ${x2} ${y2}`;
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
