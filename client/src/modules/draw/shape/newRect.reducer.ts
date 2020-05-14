// TODO: This filename will likely change.
// Vaguely, this belongs inside shape.reducer.ts -- but not sure how to keep file size reasonable.

import { createAsyncThunk } from '@reduxjs/toolkit';
import { DrawReducer, DrawActionPending } from '../draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { RECT_WIDTH, RECT_HEIGHT } from './type/Rect';
import { zoomLeveltoScaleMap } from '../../svg/zoom/zoom.reducer';
import { GroupingRect, Rect } from './shape.reducer';
import { save } from '../mixins/save/save.reducer';

export interface NewRectState {
  clickX: number;
  clickY: number;
}

export interface NewRect {
  id: string;
  clickX: number;
  clickY: number;
  svgTopLeftX: number;
  svgTopLeftY: number;
  svgScale: number;
  svgZoomLevel: number;
  boardId: string;
}

export const startNewRectFn: DrawReducer<NewRectState> = (state, action) => {
  state.newRect = {
    clickX: action.payload.clickX,
    clickY: action.payload.clickY,
  };
};

// endNewRectByClick saves the optimistic update to the DB.
export const endNewRectByClick = createAsyncThunk(
  'draw/endNewRectByClick',
  async ({ id }: NewRect, thunkAPI) => {
    thunkAPI.dispatch(save(id));
  }
);

// endNewRectByClickPending optimistically updates the shape
export const endNewRectByClickPending: DrawActionPending<NewRect> = (
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
    svgTopLeftX,
    svgTopLeftY,
    svgScale,
    svgZoomLevel,
    boardId,
  } = action.meta.arg;

  // cancel this event if we've started dragging
  // TODO: need to cancel the async dispatch after
  // https://redux-toolkit.js.org/api/createAsyncThunk#cancellation
  if (state.newRect.clickX !== clickX || state.newRect.clickY !== clickY)
    return;

  const x = (clickX - svgTopLeftX) / svgScale;
  const y = (clickY - svgTopLeftY) / svgScale;

  const width = RECT_WIDTH / zoomLeveltoScaleMap[svgZoomLevel];
  const height = RECT_HEIGHT / zoomLeveltoScaleMap[svgZoomLevel];

  const rect: Rect = {
    type: 'rect',
    id: id,
    text: 'Concept',
    x: x - width / 2,
    y: y - height / 2,
    width: width,
    height: height,
    createdAtZoomLevel: svgZoomLevel,
    boardId: boardId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
    translateX: 0,
    translateY: 0,
    deltaWidth: 0,
    deltaHeight: 0,
    isLastUpdatedBySync: false,
    isSavedInDB: true,
  };

  // state.drag = null;
  state.newRect = null;
  state.shapes[rect.id] = rect;
  reorder(rect, state);

  state.select = {
    id: rect.id,
    isEditing: false,
  };
};

export const endNewRectByDragFn: DrawReducer<NewRect> = (state, action) => {
  if (!state.newRect) {
    throw new Error(
      'Cannot create rect on drag. Missing newRect state. Was draw/startNewRect called first?'
    );
  }

  const {
    id,
    clickX,
    clickY,
    svgTopLeftX,
    svgTopLeftY,
    svgScale,
    svgZoomLevel,
    boardId,
  } = action.payload;

  const { clickX: startX, clickY: startY } = state.newRect;

  // prevent more draw/endNewRectByDrag event from firing.
  state.newRect = null;

  const x = (startX - svgTopLeftX) / svgScale;
  const y = (startY - svgTopLeftY) / svgScale;
  const width =
    (clickX - svgTopLeftX) / svgScale - (startX - svgTopLeftX) / svgScale;
  const height =
    (clickY - svgTopLeftY) / svgScale - (startY - svgTopLeftY) / svgScale;

  const rect: GroupingRect = {
    type: 'grouping_rect',
    id: id,
    text: 'Group',
    x: x,
    y: y,
    translateX: 0,
    translateY: 0,
    width: width,
    height: height,
    deltaWidth: 0,
    deltaHeight: 0,
    createdAtZoomLevel: svgZoomLevel,
    isLastUpdatedBySync: false,
    isSavedInDB: false,
    boardId: boardId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
  };

  state.shapes[id] = rect;
  reorder(rect, state);

  // Setting resize is similar to firing the draw/startResize events.
  // resize events will occur on mouse move; endResize occurs on mouse up.
  state.resize = {
    id: id,
    anchor: 'SEAnchor',
    originalX: startX,
    originalY: startY,
    clickX: 0,
    clickY: 0,
  };
};
