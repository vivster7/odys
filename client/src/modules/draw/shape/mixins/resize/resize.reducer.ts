import { DrawReducer, DrawActionPending } from 'modules/draw/draw.reducer';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { save } from 'modules/draw/mixins/save/save.reducer';
import { TimeTravelSafeAction } from 'modules/draw/timetravel/timeTravel';
import { getShape } from '../../shape.reducer';
import { applySelect } from 'modules/draw/mixins/multiSelect/multiSelect.reducer';
import { getConnectedArrows } from 'modules/draw/arrow/arrow.reducer';
import { positionArrowsFn } from 'modules/draw/arrowposition/arrowPosition.reducer';

export type NEAnchor = 'NEAnchor';
export type NWAnchor = 'NWAnchor';
export type SEAnchor = 'SEAnchor';
export type SWAnchor = 'SWAnchor';
export type Anchor = NEAnchor | NWAnchor | SEAnchor | SWAnchor;

export interface ResizeState {
  id: string;
  anchor: Anchor;
  originalX: number;
  originalY: number;
  clickX: number;
  clickY: number;
  // isNewRect is true when we create a new rect by drag
  isNewRect: boolean;
}

export interface Resizable {
  id: string;
  width: number;
  height: number;
  deltaWidth: number;
  deltaHeight: number;
  x: number;
  y: number;
  translateX: number;
  translateY: number;
}

interface StartResize {
  id: string;
  anchor: Anchor;
  originalX: number;
  originalY: number;
}

interface Resize {
  clickX: number;
  clickY: number;
  canvasTopLeftX: number;
  canvasTopLeftY: number;
  canvasScale: number;
}

export const startResizeFn: DrawReducer<StartResize> = (state, action) => {
  const { id, anchor, originalX, originalY } = action.payload;
  state.resize = {
    id: id,
    anchor: anchor,
    originalX: originalX,
    originalY: originalY,
    clickX: 0,
    clickY: 0,
    isNewRect: false,
  };
};

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
  const { originalX, originalY } = state.resize;

  // scaled click is where the pointer currently is on the canvas
  const scaledClickX = (clickX - canvasTopLeftX) / canvasScale;
  const scaledClickY = (clickY - canvasTopLeftY) / canvasScale;

  // scaled original is where the resizing event began on the canvas
  const scaledOriginalX = (originalX - canvasTopLeftX) / canvasScale;
  const scaledOriginalY = (originalY - canvasTopLeftY) / canvasScale;

  let translateX = 0;
  let deltaWidth = 0;
  let translateY = 0;
  let deltaHeight = 0;

  // BEWARE: This code is quite hard to follow. The translate's and the delta's
  // do not play well together. Came together via trial and error instead of
  // logic. Consider rewriting like multiselect (commit 39aa589dd)

  function southY() {
    let [translateY, deltaHeight] = [0, 0];
    if (scaledClickY >= shape.y) {
      translateY = 0;
      deltaHeight = scaledClickY - scaledOriginalY;
    } else {
      translateY = scaledClickY - shape.y;
      deltaHeight = shape.y - scaledClickY - (scaledOriginalY - shape.y);
    }
    return { translateY, deltaHeight };
  }

  function eastX() {
    let [translateX, deltaWidth] = [0, 0];
    if (scaledClickX >= shape.x) {
      translateX = 0;
      deltaWidth = scaledClickX - scaledOriginalX;
    } else {
      translateX = scaledClickX - shape.x;
      deltaWidth = shape.x - scaledClickX - (scaledOriginalX - shape.x);
    }
    return { translateX, deltaWidth };
  }

  function northY() {
    let [translateY, deltaHeight] = [0, 0];
    if (scaledClickY >= shape.y + shape.height) {
      translateY = shape.height;
      deltaHeight =
        scaledClickY - (scaledOriginalY + shape.height + shape.height);
    } else {
      translateY = scaledClickY - shape.y;
      deltaHeight = shape.y - scaledClickY - (scaledOriginalY - shape.y);
    }
    return { translateY, deltaHeight };
  }

  function westX() {
    let [translateX, deltaWidth] = [0, 0];
    if (scaledClickX <= shape.x + shape.width) {
      translateX = scaledClickX - scaledOriginalX;
      deltaWidth = shape.x - scaledClickX;
    } else {
      translateX = shape.width;
      deltaWidth = scaledClickX - (scaledOriginalX + shape.width + shape.width);
    }
    return { translateX, deltaWidth };
  }

  switch (state.resize.anchor) {
    case 'SEAnchor':
      let [SESouth, SEEast] = [southY(), eastX()];
      translateX = SEEast.translateX;
      deltaWidth = SEEast.deltaWidth;
      translateY = SESouth.translateY;
      deltaHeight = SESouth.deltaHeight;
      break;
    case 'SWAnchor':
      let [SWSouth, SWWest] = [southY(), westX()];
      translateX = SWWest.translateX;
      deltaWidth = SWWest.deltaWidth;
      translateY = SWSouth.translateY;
      deltaHeight = SWSouth.deltaHeight;
      break;
    case 'NEAnchor':
      let [NENorth, NEEast] = [northY(), eastX()];
      translateX = NEEast.translateX;
      deltaWidth = NEEast.deltaWidth;
      translateY = NENorth.translateY;
      deltaHeight = NENorth.deltaHeight;
      break;
    case 'NWAnchor':
      let [NWNorth, NWWest] = [northY(), westX()];
      translateX = NWWest.translateX;
      deltaWidth = NWWest.deltaWidth;
      translateY = NWNorth.translateY;
      deltaHeight = NWNorth.deltaHeight;
      break;
    default:
      throw new Error(`Unknown anchor point ${state.resize.anchor}`);
  }

  shape.translateX = translateX;
  shape.translateY = translateY;
  shape.deltaWidth = deltaWidth;
  shape.deltaHeight = deltaHeight;

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
    translateX: 0,
    translateY: 0,
    deltaWidth: 0,
    deltaHeight: 0,
    isSavedInDB: true,
  });

  const shape = state.shapes[id];
  shape.x = shape.x + shape.translateX;
  shape.y = shape.y + shape.translateY;
  shape.translateX = 0;
  shape.translateY = 0;
  shape.width = shape.width + shape.deltaWidth;
  shape.height = shape.height + shape.deltaHeight;
  shape.deltaWidth = 0;
  shape.deltaHeight = 0;
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
