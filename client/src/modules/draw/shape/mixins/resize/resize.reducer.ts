import { DrawReducer, DrawActionPending } from 'modules/draw/draw.reducer';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { save } from 'modules/draw/mixins/save/save.reducer';
import { TimeTravelSafeAction } from 'modules/draw/timetravel/timeTravel';
import { getShape } from '../../shape.reducer';
import { applySelect } from 'modules/draw/mixins/multiSelect/multiSelect.reducer';
import { getConnectedArrows } from 'modules/draw/arrow/arrow.reducer';
import { positionArrowsFn } from 'modules/draw/arrowposition/arrowPosition.reducer';
import Box from 'math/box';

export type NEAnchor = 'NEAnchor';
export type NWAnchor = 'NWAnchor';
export type SEAnchor = 'SEAnchor';
export type SWAnchor = 'SWAnchor';
export type Anchor = NEAnchor | NWAnchor | SEAnchor | SWAnchor;

export interface ResizeState {
  id: string;
  anchor: Anchor;
  prevX: number;
  prevY: number;
  start: Box;
  // isNewRect is true when we create a new rect by drag
  isNewRect: boolean;
}

export interface Resizable {
  id: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

interface StartResize {
  id: string;
  anchor: Anchor;
  prevX: number;
  prevY: number;
}

export const startResizeFn: DrawReducer<StartResize> = (state, action) => {
  const { id, anchor, prevX, prevY } = action.payload;
  const shape = getShape(state, id);
  state.resize = {
    id: id,
    anchor: anchor,
    prevX: prevX,
    prevY: prevY,
    isNewRect: false,
    start: {
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
    },
  };
};

interface Resize {
  clickX: number;
  clickY: number;
  canvasTopLeftX: number;
  canvasTopLeftY: number;
  canvasScale: number;
}

export const resizeFn: DrawReducer<Resize> = (state, action) => {
  if (!state.resize) {
    throw new Error(
      'Cannot ODYS_RESIZE_ACTION without `state.resize` (did ODYS_START_RESIZE_ACTION fire first?)'
    );
  }

  const { id } = state.resize;
  const shape = getShape(state, id);

  const {
    clickX,
    clickY,
    canvasTopLeftX,
    canvasTopLeftY,
    canvasScale,
  } = action.payload;
  const { prevX, prevY } = state.resize;

  // scaled click is where the pointer currently is on the canvas
  const scaledClickX = (clickX - canvasTopLeftX) / canvasScale;
  const scaledClickY = (clickY - canvasTopLeftY) / canvasScale;

  // scaled original is where the resizing event began on the canvas
  const scaledOriginalX = (prevX - canvasTopLeftX) / canvasScale;
  const scaledOriginalY = (prevY - canvasTopLeftY) / canvasScale;

  const deltaX = scaledClickX - scaledOriginalX;
  const deltaY = scaledClickY - scaledOriginalY;

  if (state.resize.anchor === 'SEAnchor') {
    const newWidth = shape.width + deltaX;
    const newHeight = shape.height + deltaY;
    if (newWidth >= 0) {
      shape.width = newWidth;
    } else {
      shape.width = 0;
      state.resize.anchor = 'SWAnchor';
    }

    if (newHeight >= 0) {
      shape.height = newHeight;
    } else {
      shape.height = 0;
      state.resize.anchor = 'NEAnchor';
    }
  } else if (state.resize.anchor === 'SWAnchor') {
    const newX = shape.x + deltaX;
    const newWidth = shape.width - deltaX;
    const newHeight = shape.height + deltaY;

    if (newWidth >= 0) {
      shape.x = newX;
      shape.width = newWidth;
    } else {
      shape.x = newX - Math.abs(newWidth);
      shape.width = 0;
      state.resize.anchor = 'SEAnchor';
    }

    if (newHeight >= 0) {
      shape.height = newHeight;
    } else {
      shape.height = 0;
      state.resize.anchor = 'NWAnchor';
    }
  } else if (state.resize.anchor === 'NEAnchor') {
    const newY = shape.y + deltaY;
    const newWidth = shape.width + deltaX;
    const newHeight = shape.height - deltaY;

    if (newWidth >= 0) {
      shape.width = newWidth;
    } else {
      shape.width = 0;
      state.resize.anchor = 'NWAnchor';
    }

    if (newHeight >= 0) {
      shape.y = newY;
      shape.height = newHeight;
    } else {
      shape.y = newY - Math.abs(newHeight);
      shape.height = 0;
      state.resize.anchor = 'SEAnchor';
    }
  } else if (state.resize.anchor === 'NWAnchor') {
    const newX = shape.x + deltaX;
    const newY = shape.y + deltaY;
    const newWidth = shape.width - deltaX;
    const newHeight = shape.height - deltaY;

    if (newWidth >= 0) {
      shape.x = newX;
      shape.width = newWidth;
    } else {
      shape.x = newX - Math.abs(newWidth);
      shape.width = 0;
      state.resize.anchor = 'NEAnchor';
    }

    if (newHeight >= 0) {
      shape.y = newY;
      shape.height = newHeight;
    } else {
      shape.y = newY - Math.abs(newHeight);
      shape.height = 0;
      state.resize.anchor = 'SWAnchor';
    }
  }

  state.resize.prevX = clickX;
  state.resize.prevY = clickY;

  const connectedArrows = getConnectedArrows(state, [shape.id]);
  positionArrowsFn(state, {
    type: 'draw/positionArrows',
    payload: connectedArrows,
  });
};

interface EndResize {
  id: string;
}

// endResize saves the optimistic update to the DB.
export const endResize = createAsyncThunk(
  'draw/endResize',
  async ({ id }: EndResize, thunkAPI) => {
    thunkAPI.dispatch(save([id]));
  }
);

// endResizePending optimistically updates the shape
export const endResizePending: DrawActionPending<EndResize> = (
  state,
  action
) => {
  if (!state.resize) {
    throw new Error(
      'Could not end resize shape action. Was it started with ODYS_START_RESIZE_ACTION?'
    );
  }

  const { id } = action.meta.arg;
  const { isNewRect } = state.resize;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  const snapshot = Object.assign({}, state.shapes[id], {
    x: state.resize.start.x,
    y: state.resize.start.y,
    width: state.resize.start.width,
    height: state.resize.start.height,
    isSavedInDB: true,
  });

  const shape = state.shapes[id];
  shape.isSavedInDB = true;

  state.drag = null;
  state.newRect = null;
  state.resize = null;

  if (isNewRect) {
    applySelect(state, [shape]);
  }

  const undo: TimeTravelSafeAction = isNewRect
    ? { actionCreatorName: 'safeDeleteDrawings', arg: [id] }
    : {
        actionCreatorName: 'safeUpdateDrawings',
        arg: { drawings: [snapshot] },
      };
  const redo: TimeTravelSafeAction = {
    actionCreatorName: 'safeUpdateDrawings',
    arg: { drawings: [shape] },
  };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};
