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
