// TODO: This filename will likely change.
// Vaguely, this belongs inside shape.reducer.ts -- but not sure how to keep file size reasonable.

import { PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { DrawReducer, reorder, DrawState } from '../draw.reducer';
import { RECT_WIDTH, RECT_HEIGHT } from './type/Rect';
import * as uuid from 'uuid';
import { RootState } from '../../../App';
import { zoomLeveltoScaleMap } from '../../svg/zoom/zoom.reducer';
import { Shape, GroupingRect, Rect } from './shape.reducer';

export interface NewRectByClickState {
  clickX: number;
  clickY: number;
}

interface StartNewRectByClick {
  clickX: number;
  clickY: number;
}

interface EndNewRectByClick {
  clickX: number;
  clickY: number;
}

export interface NewRectByDragState {
  clickX: number;
  clickY: number;
  shape: Shape | null;
}

interface StartNewRectByDrag {
  clickX: number;
  clickY: number;
}

interface NewRectByDrag {
  clickX: number;
  clickY: number;
  svgTopLeftX: number;
  svgTopLeftY: number;
  svgScale: number;
  svgZoomLevel: number;
  boardId: string;
}

export const startNewRectByClickFn: DrawReducer<StartNewRectByClick> = (
  state,
  action
) => {
  state.newRectByClick = {
    clickX: action.payload.clickX,
    clickY: action.payload.clickY,
  };
};

export const endNewRectByClick = createAsyncThunk(
  'draw/endNewRectByClick',
  async (args: EndNewRectByClick, thunkAPI) => {
    const { clickX, clickY } = args;

    const state = thunkAPI.getState() as RootState;
    const { svg } = state;

    // cancel this event if we've started dragging
    if (
      state.draw.newRectByClick?.clickX !== clickX ||
      state.draw.newRectByClick?.clickY !== clickY
    )
      return;

    const id = uuid.v4();
    const x = (clickX - svg.topLeftX) / svg.scale;
    const y = (clickY - svg.topLeftY) / svg.scale;

    const width = RECT_WIDTH / zoomLeveltoScaleMap[svg.zoomLevel];
    const height = RECT_HEIGHT / zoomLeveltoScaleMap[svg.zoomLevel];

    const rect: Rect = {
      type: 'rect',
      id: id,
      text: 'Concept',
      x: x - width / 2,
      y: y - height / 2,
      translateX: 0,
      translateY: 0,
      width: width,
      height: height,
      deltaWidth: 0,
      deltaHeight: 0,
      createdAtZoomLevel: svg.zoomLevel,
      isLastUpdatedBySync: false,
      boardId: state.board.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return rect;
  }
);

export const endNewRectByClickFulfilled = (
  state: DrawState,
  action: PayloadAction<Rect>
) => {
  const rect = action.payload;
  if (!rect) return;

  state.drag = null;
  state.newRectByClick = null;
  state.endNewRectByDrag = null;
  state.select = {
    id: rect.id,
    isEditing: false,
  };

  state.shapes[rect.id] = rect;
  reorder(rect, state);
};

export const startNewRectByDragFn: DrawReducer<StartNewRectByDrag> = (
  state,
  action
) => {
  state.endNewRectByDrag = {
    clickX: action.payload.clickX,
    clickY: action.payload.clickY,
    shape: null,
  };
};

export const endNewRectByDragFn: DrawReducer<NewRectByDrag> = (
  state,
  action
) => {
  if (!state.endNewRectByDrag) {
    throw new Error(
      'Cannot create rect on drag. Missing endNewRectByDrag state. Was ODYS_START_NEW_RECT_BY_DRAG_ACTION called first?'
    );
  }

  const {
    clickX,
    clickY,
    svgTopLeftX,
    svgTopLeftY,
    svgScale,
    svgZoomLevel,
    boardId,
  } = action.payload;

  if (state.endNewRectByDrag.shape) {
    state.endNewRectByDrag = null;
  } else if (state.endNewRectByDrag && !state.endNewRectByDrag.shape) {
    const id = uuid.v4();
    const x = (state.endNewRectByDrag.clickX - svgTopLeftX) / svgScale;
    const y = (state.endNewRectByDrag.clickY - svgTopLeftY) / svgScale;
    const width =
      (clickX - svgTopLeftX) / svgScale -
      (state.endNewRectByDrag.clickX - svgTopLeftX) / svgScale;
    const height =
      (clickY - svgTopLeftY) / svgScale -
      (state.endNewRectByDrag.clickY - svgTopLeftY) / svgScale;

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
      boardId: boardId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    state.endNewRectByDrag.shape = rect;
    state.shapes[id] = rect;
    reorder(rect, state);

    state.resize = {
      id: id,
      anchor: 'SEAnchor',
      originalX: state.endNewRectByDrag.clickX,
      originalY: state.endNewRectByDrag.clickY,
      clickX: 0,
      clickY: 0,
    };
  }
};
