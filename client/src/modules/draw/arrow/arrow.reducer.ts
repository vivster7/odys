import { DrawReducer, reorder, DrawState } from '../draw.reducer';
import { PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as uuid from 'uuid';
import { OdysArrow } from 'generated';
import { ArrowApi } from 'generated/apis/ArrowApi';

export interface Arrow extends OdysArrow {
  type: 'arrow';
  isLastUpdatedBySync: boolean;
}

export const getArrows = createAsyncThunk(
  'draw/getArrows',
  async (boardId: string, thunkAPI): Promise<OdysArrow[]> => {
    const api = new ArrowApi();
    return api.arrowGet({ boardId: `eq.${boardId}` });
  }
);

export const getArrowsFulfilled = (
  state: DrawState,
  action: PayloadAction<OdysArrow[]>
) => {
  const arrows = action.payload;
  arrows.forEach((a) => {
    const arrow: Arrow = {
      ...a,
      type: 'arrow',
      isLastUpdatedBySync: false,
    };
    state.arrows[a.id] = arrow;
    //TODO: order should be saved on server.
    reorder(arrow, state);
  });
};

export const drawArrowFn: DrawReducer<string> = (state, action) => {
  if (!state.select) {
    throw new Error('Cannot draw arrow without selected object.');
  }

  const selectId = state.select.id;

  // cannot draw arrow to self.
  if (selectId === action.payload) {
    return;
  }

  // cannot duplicate existing arrow.
  const existing = Object.values(state.arrows).find(
    (a) => a.fromShapeId === selectId && a.toShapeId === action.payload
  );

  if (existing) {
    return;
  }

  // cannot draw arrow across zoomLevels
  const fromShape = state.shapes[selectId];
  const toShape = state.shapes[action.payload];
  if (!fromShape) throw new Error(`Cannot find shape (${selectId})`);
  if (!toShape) throw new Error(`Cannot find shape (${action.payload})`);
  if (fromShape.type !== 'rect' && fromShape.type !== 'grouping_rect')
    throw new Error('Can only draw arrows from Rects.');
  if (toShape.type !== 'rect' && toShape.type !== 'grouping_rect')
    throw new Error('Can only draw arrows to Rects.');
  if (fromShape.createdAtZoomLevel !== toShape.createdAtZoomLevel) {
    throw new Error(
      `Cannot draw arrow across zoomLevel (createdAtZoomLevels dont match)`
    );
  }

  const arrow = {
    type: 'arrow',
    id: uuid.v4(),
    fromShapeId: selectId,
    toShapeId: action.payload,
    text: '',
    isLastUpdatedBySync: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    boardId: '1', //TODO: state.shapes[id].boardId
  } as Arrow;

  state.arrows[arrow.id] = arrow;
  reorder(arrow, state);
};
