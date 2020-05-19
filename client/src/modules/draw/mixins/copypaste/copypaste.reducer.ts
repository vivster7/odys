import {
  DrawReducer,
  getDrawings,
  DrawActionPending,
  Drawing,
  DrawActionFulfilled,
} from 'modules/draw/draw.reducer';
import { instanceOfShape, Shape } from 'modules/draw/shape/shape.reducer';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'App';
import { save } from '../save/save.reducer';
import uuid from 'uuid';
import { instanceOfArrow, Arrow } from 'modules/draw/arrow/arrow.reducer';
import { TimeTravelSafeAction } from 'modules/draw/timetravel/timeTravel';
import { reorder } from '../drawOrder/drawOrder';
import { outline } from 'math/box';

export interface CopyPasteState {
  // Ids of copied shapes.
  copied: string[];

  // count the times a copy is pasted. each paste will be offset.
  numTimesPasted: number;

  // Ids of pasted shapes.
  pasted: string[];

  // Ids of cut shapes.
  cut: string[];
}

export const copyFn: DrawReducer = (state, action) => {
  const allIds = [];
  if (state.select) {
    allIds.push(state.select.id);
  }

  if (state.multiSelect) {
    allIds.push(...Object.keys(state.multiSelect.selectedShapeIds));
  }

  const drawings = getDrawings(state, allIds);
  // can only copy shapes
  const shapes = drawings.filter((d) => instanceOfShape(d));
  state.copyPaste.copied = shapes.map((s) => s.id);
  state.copyPaste.numTimesPasted = 0;

  // note: cannot undo ctrl+c
};

export const paste = createAsyncThunk(
  'draw/paste',
  async (arg: void, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    if (state.draw.copyPaste.pasted.length > 0) {
      thunkAPI.dispatch(save(state.draw.copyPaste.pasted));
    }
  }
);

export const pastePending: DrawActionPending = (state, action) => {
  if (state.copyPaste.copied.length === 0) return;
  // TODO: Dont paste is clipboard buffer doesn't match state.copyPaste.copied
  // this means they hit ctrl+c somewhere else. Instead we should clear our copied.

  const drawings = getDrawings(state, state.copyPaste.copied);
  const shapes = drawings.filter((c) => instanceOfShape(c)) as Shape[];
  const arrows = drawings.filter((c) => instanceOfArrow(c)) as Arrow[];

  // TODO: offset should take into account svg scale
  const offsetX = 20 * (state.copyPaste.numTimesPasted + 1);
  const offsetY = 20 * (state.copyPaste.numTimesPasted + 1);
  const clonedShapes = shapes
    .map((s) => cloneShape(s))
    .map((s) => offset(s, offsetX, offsetY));
  const oldToNew = Object.fromEntries(
    shapes.map((s, i) => [s.id, clonedShapes[i].id])
  );
  const clonedArrows = arrows.map((a) => cloneArrow(oldToNew, a));

  clonedShapes.forEach((s) => (state.shapes[s.id] = s));
  clonedArrows.forEach((a) => (state.arrows[a.id] = a));

  const pasted: Drawing[] = [...clonedShapes, ...clonedArrows];
  reorder(pasted, state);

  // TODO: share logic better with endDragSelectionFn
  if (pasted.length === 1) {
    state.select = { id: pasted[0].id };
  } else {
    state.multiSelect = {
      selectionRect: null,
      selectedShapeIds: Object.fromEntries(
        clonedShapes.map((s) => [s.id, true])
      ),
      outline: outline(...clonedShapes),
    };
  }

  state.copyPaste.numTimesPasted += 1;
  state.copyPaste.pasted = pasted.map((p) => p.id);

  const undo: TimeTravelSafeAction = {
    actionCreatorName: 'safeDeleteDrawings',
    arg: pasted.map((p) => p.id),
  };
  const redo: TimeTravelSafeAction = {
    actionCreatorName: 'safeUpdateDrawings',
    arg: pasted,
  };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};

export const pasteFulfilled: DrawActionFulfilled = (state, action) => {
  state.copyPaste.pasted = [];
};

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
