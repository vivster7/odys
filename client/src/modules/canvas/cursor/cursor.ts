export interface Cursor {
  x: number;
  y: number;
}

const CLICK_EPSILON = 5;
export function cursorWithinEpsilon(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  canvasScale: number
) {
  const eps = CLICK_EPSILON / canvasScale;
  return Math.abs(endX - startX) < eps && Math.abs(endY - startY) < eps;
}

export function translateCursorPosition(
  clientX: number,
  clientY: number,
  topLeftX: number,
  topLeftY: number,
  scale: number
) {
  /**
    This translates the client screen cursor position to its true canvas position
  */
  return {
    x: (clientX - topLeftX) / scale,
    y: (clientY - topLeftY) / scale,
  };
}
