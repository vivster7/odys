import { createAsyncThunk, ActionCreatorsMapObject } from '@reduxjs/toolkit';
import {
  Drawing,
  DrawActionPending,
  getDrawings,
  cancelSelect,
} from '../draw.reducer';
import { instanceOfArrow } from '../arrow/arrow.reducer';
import { reorder } from '../mixins/drawOrder/drawOrder';
import { save, saveDelete } from '../mixins/save/save.reducer';
import {
  applySelect,
  isSelected,
} from '../mixins/multiSelect/multiSelect.reducer';
import { RootState } from 'App';
import { positionArrowsFn } from '../arrowposition/arrowPosition.reducer';

// TimeTravelSafeAction promise not to modify the undo or redo buffer.
// This is not enforced by types, so pretty please just follow the rules.
export type TimeTravelSafeAction =
  | { actionCreatorName: 'safeDeleteDrawings'; arg: string[] }
  | { actionCreatorName: 'safeUpdateDrawings'; arg: SafeUpdateDrawings };

// These travel together and cancel each other out.
// If undo is called, the pair moves to `redos` state.
// If redo is called, the pair moves to `undos` state.
interface UndoRedo {
  undo: TimeTravelSafeAction;
  redo: TimeTravelSafeAction;
}

export interface TimeTravelState {
  undos: UndoRedo[];
  redos: UndoRedo[];
}

// just like draw/updateDrawing, except this will NEVER update the undo/redo buffer
export const safeUpdateDrawings = createAsyncThunk(
  'draw/safeUpdateDrawings',
  async ({ drawings }: SafeUpdateDrawings, thunkAPI) => {
    thunkAPI.dispatch(save(drawings.map((d) => d.id)));
  }
);

interface SafeUpdateDrawings {
  drawings: Drawing[];
}

export const safeUpdateDrawingsPending: DrawActionPending<SafeUpdateDrawings> = (
  state,
  action
) => {
  const updates: Drawing[] = action.meta.arg.drawings;
  const drawings: Drawing[] = updates.map((update) => {
    const existing: Drawing =
      state.shapes[update.id] ?? state.arrows[update.id] ?? {};
    return { ...existing, ...update };
  });

  drawings.forEach((d) => {
    if (instanceOfArrow(d)) {
      state.arrows[d.id] = d;
    } else {
      state.shapes[d.id] = d;
    }
  });
  reorder(drawings, state);
  applySelect(state, drawings);
  state.editText = null;

  const arrows = drawings.filter(instanceOfArrow);
  positionArrowsFn(state, { type: 'draw/positionArrows', payload: arrows });
};

// just like draw/deleteDrawing, except this will NEVER update the undo/redo buffer
export const safeDeleteDrawings = createAsyncThunk(
  'draw/safeDeleteDrawings',
  async (ids: string[], thunkAPI) => {
    thunkAPI.dispatch(saveDelete(ids));

    const state = thunkAPI.getState() as RootState;
    if (isSelected(state.draw, ids)) {
      thunkAPI.dispatch(cancelSelect());
    }
  }
);

export const safeDeleteDrawingsPending: DrawActionPending<string[]> = (
  state,
  action
) => {
  const ids = action.meta.arg;
  const drawings = getDrawings(state, ids);

  drawings.forEach((d) => (d.isDeleted = true));
  reorder(drawings, state);

  const arrows = drawings.filter(instanceOfArrow);
  positionArrowsFn(state, { type: 'draw/positionArrows', payload: arrows });
};

export const actionCreatorMap: ActionCreatorsMapObject = {
  safeDeleteDrawings: safeDeleteDrawings,
  safeUpdateDrawings: safeUpdateDrawings,
};
