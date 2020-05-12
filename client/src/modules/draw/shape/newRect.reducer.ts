// TODO: This filename will likely change.
// Vaguely, this belongs inside shape.reducer.ts -- but not sure how to keep file size reasonable.

import { PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { DrawReducer, reorder, DrawState } from '../draw.reducer';
import { RECT_WIDTH, RECT_HEIGHT } from './type/Rect';
import * as uuid from 'uuid';
import { RootState } from '../../../App';
import { zoomLeveltoScaleMap } from '../../svg/zoom/zoom.reducer';
import { Shape, GroupingRect, Rect } from './shape.reducer';
import { ShapeApi } from 'generated';

export interface NewRectState {
  clickX: number;
  clickY: number;
  shape: Shape | null;
}

interface StartNewRect {
  clickX: number;
  clickY: number;
}

export const startNewRectFn: DrawReducer<StartNewRect> = (state, action) => {
  state.newRect = {
    clickX: action.payload.clickX,
    clickY: action.payload.clickY,
    shape: null,
  };
};

interface EndNewRectByClick {
  clickX: number;
  clickY: number;
}

export const endNewRectByClick = createAsyncThunk(
  'draw/endNewRectByClick',
  async (args: EndNewRectByClick, thunkAPI) => {
    const { clickX, clickY } = args;

    const state = thunkAPI.getState() as RootState;
    const { svg } = state;

    // cancel this event if we've started dragging
    if (
      state.draw.newRect?.clickX !== clickX ||
      state.draw.newRect?.clickY !== clickY
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
      width: width,
      height: height,
      createdAtZoomLevel: svg.zoomLevel,
      boardId: state.board.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      translateX: 0,
      translateY: 0,
      deltaWidth: 0,
      deltaHeight: 0,
      isLastUpdatedBySync: false,
    };

    // const api = new ShapeApi()
    // await api.shapePost({ shape: rect });

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
  state.newRect = null;
  state.select = {
    id: rect.id,
    isEditing: false,
  };

  state.shapes[rect.id] = rect;
  reorder(rect, state);
};

interface NewRectByDrag {
  clickX: number;
  clickY: number;
  svgTopLeftX: number;
  svgTopLeftY: number;
  svgScale: number;
  svgZoomLevel: number;
  boardId: string;
}

export const endNewRectByDragFn: DrawReducer<NewRectByDrag> = (
  state,
  action
) => {
  if (!state.newRect) {
    throw new Error(
      'Cannot create rect on drag. Missing newRect state. Was draw/startNewRect called first?'
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

  if (state.newRect.shape) {
    state.newRect = null;
  } else if (state.newRect && !state.newRect.shape) {
    const id = uuid.v4();
    const x = (state.newRect.clickX - svgTopLeftX) / svgScale;
    const y = (state.newRect.clickY - svgTopLeftY) / svgScale;
    const width =
      (clickX - svgTopLeftX) / svgScale -
      (state.newRect.clickX - svgTopLeftX) / svgScale;
    const height =
      (clickY - svgTopLeftY) / svgScale -
      (state.newRect.clickY - svgTopLeftY) / svgScale;

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

    state.newRect.shape = rect;
    state.shapes[id] = rect;
    reorder(rect, state);

    state.resize = {
      id: id,
      anchor: 'SEAnchor',
      originalX: state.newRect.clickX,
      originalY: state.newRect.clickY,
      clickX: 0,
      clickY: 0,
    };
  }
};
