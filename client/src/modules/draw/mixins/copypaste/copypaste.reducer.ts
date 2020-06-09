import {
  getDrawings,
  Drawing,
  updateDrawings,
} from 'modules/draw/draw.reducer';
import { deleteDrawings } from 'modules/draw/mixins/delete/delete.reducer';
import {
  instanceOfShape,
  Shape,
  newShape,
} from 'modules/draw/shape/shape.reducer';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'App';
import uuid from 'uuid';
import { Arrow, instanceOfArrow } from 'modules/draw/arrow/arrow.reducer';
import { allSelectedIds } from '../select/select.reducer';
import { SHAPE_WIDTH, SHAPE_HEIGHT } from 'modules/draw/shape/type/BaseShape';
import Point from 'math/point';

export const copy = createAsyncThunk(
  'draw/copy',
  async (arg: undefined, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;

    const allIds = allSelectedIds(state.draw);
    const shapes = getDrawings(state.draw, allIds).filter(instanceOfShape);
    const shapeIds = new Set(...[shapes.map((s) => s.id)]);
    const arrows = Object.values(state.draw.arrows).filter(
      (a) => shapeIds.has(a.fromShapeId) && shapeIds.has(a.toShapeId)
    );

    const drawings = [...shapes, ...arrows];
    const copy = { type: 'whiteboard-systems-data', data: drawings };
    await navigator.clipboard.writeText(JSON.stringify(copy));
  }
);

export const paste = createAsyncThunk(
  'draw/paste',
  async (arg: undefined, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const text = await navigator.clipboard.readText();
    if (!text) return;

    const { x, y } = state.canvas.cursor;

    try {
      const json = JSON.parse(text);
      if (json['type'] !== 'whiteboard-systems-data') {
        throw new Error('Unknown copy/paste text');
      }

      const data = json['data'] as Drawing[];
      const clones = cloneDrawings(data);
      const arrows = clones.filter(instanceOfArrow);
      const shapes = clones.filter(instanceOfShape);

      const mid = midpoint(shapes);
      const [translateX, translateY] = [x - mid.x, y - mid.y];
      const offsetShapes = shapes.map((s) => offset(s, translateX, translateY));
      const drawings: Drawing[] = [...offsetShapes, ...arrows];
      thunkAPI.dispatch(updateDrawings(drawings));
    } catch (e) {
      const shape = newShape(state.board.id, {
        type: 'text',
        x: x - SHAPE_WIDTH / 2,
        y: y - SHAPE_HEIGHT / 2,
        text,
      });
      thunkAPI.dispatch(updateDrawings([shape]));
    }
  }
);

export const cut = createAsyncThunk('draw/cut', async (arg: void, thunkAPI) => {
  const state = thunkAPI.getState() as RootState;
  thunkAPI.dispatch(copy());
  const allIds = allSelectedIds(state.draw);
  thunkAPI.dispatch(deleteDrawings({ ids: allIds }));
});

function midpoint(shapes: Shape[]): Point {
  if (shapes.length === 0) return { x: 0, y: 0 };
  const s = shapes[0];
  let [minX, maxX, minY, maxY] = [s.x, s.x + s.width, s.y, s.y + s.height];
  shapes.forEach((s) => {
    minX = Math.min(minX, s.x);
    maxX = Math.max(maxX, s.x + s.width);
    minY = Math.min(minY, s.y);
    maxY = Math.max(maxY, s.y + s.height);
  });
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
}

function cloneDrawings(drawings: Drawing[]): Drawing[] {
  const shapes = drawings.filter((c) => instanceOfShape(c)) as Shape[];
  const arrows = drawings.filter((c) => instanceOfArrow(c)) as Arrow[];

  const clonedShapes = shapes.map((s) => cloneShape(s));

  const oldToNew = Object.fromEntries(
    shapes.map((s, i) => [s.id, clonedShapes[i].id])
  );

  // after creating the `oldToNew` mapping, we can update the `parentId` value
  clonedShapes.forEach((s) => (s.parentId = oldToNew[s.parentId]));
  const clonedArrows = arrows.map((a) => cloneArrow(oldToNew, a));
  return [...clonedShapes, ...clonedArrows];
}

function cloneShape(s: Shape): Shape {
  return {
    ...s,
    id: uuid.v4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function cloneArrow(mapping: { [id: string]: string }, a: Arrow): Arrow {
  return {
    ...a,
    id: uuid.v4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fromShapeId: mapping[a.fromShapeId],
    toShapeId: mapping[a.toShapeId],
  };
}

function offset(s: Shape, x: number, y: number): Shape {
  return { ...s, x: s.x + x, y: s.y + y };
}
