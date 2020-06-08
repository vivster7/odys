// TODO: This filename will likely change.
// Vaguely, this belongs inside shape.reducer.ts -- but not sure how to keep file size reasonable.

import { createAsyncThunk } from '@reduxjs/toolkit';
import { DrawReducer, DrawActionPending, Drawing } from '../draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { newShape, Shape } from './shape.reducer';
import { save } from '../mixins/save/save.reducer';
import { TimeTravelSafeAction } from '../timetravel/timeTravel';
import { Arrow } from '../arrow/arrow.reducer';
import { isOverlapping } from 'math/box';
import { SHAPE_WIDTH, SHAPE_HEIGHT } from './type/BaseShape';
import { applySelect } from '../mixins/multiSelect/multiSelect.reducer';

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

  const rect: Shape = newShape(boardId, {
    id: id,
    type: 'rect',
    text: '',
    x: x - SHAPE_WIDTH / 2,
    y: y - SHAPE_HEIGHT / 2,
  });

  state.newRect = null;
  state.shapes[rect.id] = rect;
  reorder([rect], state);
  applySelect(state, [rect]);

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
