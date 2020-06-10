import { Drawing, updateDrawings } from 'modules/draw/draw.reducer';
import { deleteDrawings } from 'modules/draw/mixins/delete/delete.reducer';
import {
  instanceOfShape,
  Shape,
  newShape,
  getShapes,
} from 'modules/draw/shape/shape.reducer';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'App';
import uuid from 'uuid';
import { Arrow, instanceOfArrow } from 'modules/draw/arrow/arrow.reducer';
import { allSelectedIds } from '../select/select.reducer';
import { SHAPE_WIDTH, SHAPE_HEIGHT } from 'modules/draw/shape/type/BaseShape';
import { midpoint } from 'math/box';

export const copy = createAsyncThunk(
  'draw/copy',
  async (arg: undefined, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;

    const allIds = allSelectedIds(state.draw);
    const shapes = getShapes(state.draw, allIds);
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
      const clones = cloneDrawings(data, state.board.id);
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

function cloneDrawings(drawings: Drawing[], boardId?: string): Drawing[] {
  const shapes = drawings.filter(instanceOfShape);
  const arrows = drawings.filter(instanceOfArrow);

  const shapeExtras: Partial<Shape> = {};
  if (boardId !== undefined) {
    shapeExtras['boardId'] = boardId;
  }
  const clonedShapes = shapes.map((s) => cloneShape(s, shapeExtras));

  const oldToNew = Object.fromEntries(
    shapes.map((s, i) => [s.id, clonedShapes[i].id])
  );

  // after creating the `oldToNew` mapping, we can update the `parentId` value
  clonedShapes.forEach((s) => (s.parentId = oldToNew[s.parentId] || ''));

  const arrowExtras: Partial<Shape> = {};
  if (boardId !== undefined) {
    arrowExtras['boardId'] = boardId;
  }
  const clonedArrows = arrows.map((a) => cloneArrow(oldToNew, a, arrowExtras));
  return [...clonedShapes, ...clonedArrows];
}

function cloneShape(s: Shape, extras: Partial<Shape>): Shape {
  return {
    ...s,
    id: uuid.v4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...extras,
  };
}

function cloneArrow(
  mapping: { [id: string]: string },
  a: Arrow,
  extras: Partial<Arrow>
): Arrow {
  return {
    ...a,
    id: uuid.v4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fromShapeId: mapping[a.fromShapeId],
    toShapeId: mapping[a.toShapeId],
    ...extras,
  };
}

function offset(s: Shape, x: number, y: number): Shape {
  return { ...s, x: s.x + x, y: s.y + y };
}
