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
  if (rects.length === 0) throw new Error('`outline` needs >0 input `rects`');
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

export default Box;
