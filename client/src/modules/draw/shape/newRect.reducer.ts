// TODO: This filename will likely change.
// Vaguely, this belongs inside shape.reducer.ts -- but not sure how to keep file size reasonable.

import { createAsyncThunk } from '@reduxjs/toolkit';
import { DrawReducer, DrawActionPending, Drawing } from '../draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { RECT_WIDTH, RECT_HEIGHT } from './type/Rect';
import { Rect } from './shape.reducer';
import { save } from '../mixins/save/save.reducer';
import { TimeTravelSafeAction } from '../timetravel/timeTravel';
import { DEFAULT_ZOOM_LEVEL } from 'modules/canvas/zoom/zoom.reducer';
import { Arrow } from '../arrow/arrow.reducer';
import { isOverlapping } from 'math/box';

export interface NewRectState {
  clickX: number;
  clickY: number;
  selectedShapeId?: string;
}

export const startNewRectFn: DrawReducer<NewRectState> = (state, action) => {
  state.newRect = {
    clickX: action.payload.clickX,
    clickY: action.payload.clickY,
    selectedShapeId: action.payload.selectedShapeId,
  };
};

export interface NewRect {
  id: string;
  clickX: number;
  clickY: number;
  canvasTopLeftX: number;
  canvasTopLeftY: number;
  canvasScale: number;
  canvasZoomLevel: number;
  boardId: string;
}

export interface NewRectWithArrow extends NewRect {
  arrowId: string;
  selectedShapeId?: string;
}

// endNewRectByClick saves the optimistic update to the DB.
export const endNewRectByClick = createAsyncThunk(
  'draw/endNewRectByClick',
  async ({ id, arrowId, selectedShapeId }: NewRectWithArrow, thunkAPI) => {
    const toSave = selectedShapeId === undefined ? [id] : [id, arrowId];
    thunkAPI.dispatch(save(toSave));
  }
);

// endNewRectByClickPending optimistically updates the shape
export const endNewRectByClickPending: DrawActionPending<NewRectWithArrow> = (
  state,
  action
) => {
  if (!state.newRect) {
    throw new Error(
      'Cannot create rect on drag. Missing newRect state. Was draw/startNewRect called first?'
    );
  }

  const {
    id,
    clickX,
    clickY,
    canvasTopLeftX,
    canvasTopLeftY,
    canvasScale,
    boardId,
    arrowId,
    selectedShapeId,
  } = action.meta.arg;

  const x = (clickX - canvasTopLeftX) / canvasScale;
  const y = (clickY - canvasTopLeftY) / canvasScale;

  const width = RECT_WIDTH;
  const height = RECT_HEIGHT;

  const rect: Rect = {
    type: 'rect',
    id: id,
    text: '',
    x: x - width / 2,
    y: y - height / 2,
    width: width,
    height: height,
    createdAtZoomLevel: DEFAULT_ZOOM_LEVEL,
    boardId: boardId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
    translateX: 0,
    translateY: 0,
    deltaWidth: 0,
    deltaHeight: 0,
    isSavedInDB: true,
    parentId: '',
  };

  state.newRect = null;
  state.shapes[rect.id] = rect;
  reorder([rect], state);

  state.select = {
    id: rect.id,
  };

  let undoArg = [id];
  let redoArg: { drawings: Drawing[] } = { drawings: [rect] };

  if (selectedShapeId) {
    const selectedShape = state.shapes[selectedShapeId];
    if (!isOverlapping(selectedShape, rect)) {
      const arrow: Arrow = {
        id: arrowId,
        fromShapeId: selectedShapeId,
        toShapeId: id,
        text: '',
        isSavedInDB: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        boardId: boardId,
        isDeleted: false,
      };
      state.arrows[arrow.id] = arrow;
      reorder([arrow], state);

      undoArg.push(arrowId);
      redoArg.drawings.push(arrow);
    }
  }

  const undo: TimeTravelSafeAction = {
    actionCreatorName: 'safeDeleteDrawings',
    arg: undoArg,
  };
  const redo: TimeTravelSafeAction = {
    actionCreatorName: 'safeUpdateDrawings',
    arg: redoArg,
  };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};
