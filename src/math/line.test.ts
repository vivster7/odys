import Line from './line';

it('needs two separate points to create line', () => {
  expect(() => new Line({ x: 0, y: 0 }, { x: 0, y: 0 })).toThrow();
});

it('correctly calculates intersection of 2 lines', () => {
  const l1 = new Line({ x: 0, y: 0 }, { x: 1, y: 1 });
  const l2 = new Line({ x: 0, y: 0 }, { x: 1, y: 2 });
  expect(l1.intersects(l2)).toEqual({ x: 0, y: 0 });

  const l3 = new Line({ x: -3, y: 10 }, { x: 7, y: 4 });
  const l4 = new Line({ x: 12, y: 1 }, { x: 4, y: 2 });
  expect(l3.intersects(l4)).toEqual({ x: 12, y: 1 });
});
