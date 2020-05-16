import { DrawReducer, DrawActionPending } from '../../../draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { save } from 'modules/draw/mixins/save/save.reducer';

export interface DragState {
  id: string;
  clickX: number;
  clickY: number;
}

export interface Draggable {
  id: string;
  x: number;
  y: number;
  translateX: number;
  translateY: number;
}

interface Drag {
  clickX: number;
  clickY: number;
  scale: number;
}

export const startDragFn: DrawReducer<DragState> = (state, action) => {
  const id = action.payload.id;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  state.drag = {
    id: id,
    clickX: action.payload.clickX,
    clickY: action.payload.clickY,
  };

  state.shapes[id].isLastUpdatedBySync = false;
};

export const dragFn: DrawReducer<Drag> = (state, action) => {
  if (!state.drag) {
    throw new Error(
      'Cannot draw/drag without `state.drag` (did draw/startDrag fire first?)'
    );
  }

  const { id } = state.drag;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  const { clickX, clickY, scale } = action.payload;

  const shape = state.shapes[id];
  shape.translateX = (clickX - state.drag.clickX) / scale;
  shape.translateY = (clickY - state.drag.clickY) / scale;
  shape.isLastUpdatedBySync = false;
};

interface EndDrag {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// endDrag saves the optimistic update to the DB.
export const endDrag: any = createAsyncThunk(
  'draw/endDrag',
  async ({ id, startX, startY, endX, endY }: EndDrag, thunkAPI) => {
    const hasMoved = startX !== endX || startY !== endY;
    if (hasMoved) {
      thunkAPI.dispatch(save(id));
    }
  }
);

// endDragPending optimistically updates the shape
export const endDragPending: DrawActionPending<EndDrag> = (state, action) => {
  if (!state.drag) {
    throw new Error(
      'Cannot draw/endDrag without drag state. Did draw/startDrag fire?'
    );
  }
  state.drag = null;

  const { id, startX, startY, endX, endY } = action.meta.arg;
  const hasMoved = startX !== endX || startY !== endY;
  if (!hasMoved) {
    return;
  }
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  const snapshot = Object.assign({}, state.shapes[id], {
    translateX: 0,
    translateY: 0,
    isLastUpdatedBySync: false,
    isSavedInDB: true,
  });

  const shape = state.shapes[id];
  shape.x = shape.x + shape.translateX;
  shape.y = shape.y + shape.translateY;
  shape.translateX = 0;
  shape.translateY = 0;
  shape.isLastUpdatedBySync = false;
  shape.isSavedInDB = true;
  reorder(shape, state);

  const undo = { actionCreatorName: 'safeUpdateDrawing', arg: snapshot };
  const redo = { actionCreatorName: 'safeUpdateDrawing', arg: shape };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};
