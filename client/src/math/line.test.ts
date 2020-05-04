import { intersects } from './line';

// it('needs two separate points to create line', () => {
//   expect(() => new Line({ x: 0, y: 0 }, { x: 0, y: 0 })).toThrow();
// });

it('correctly calculates intersection of 2 lines', () => {
  const l1 = { p: { x: 0, y: 0 }, q: { x: 1, y: 1 } };
  const l2 = { p: { x: 0, y: 0 }, q: { x: 1, y: 2 } };
  expect(intersects(l1, l2)).toEqual({ x: 0, y: 0 });

  const l3 = { p: { x: -3, y: 10 }, q: { x: 7, y: 4 } };
  const l4 = { p: { x: 12, y: 1 }, q: { x: 4, y: 2 } };
  expect(intersects(l3, l4)).toEqual({ x: 12, y: 1 });
});
