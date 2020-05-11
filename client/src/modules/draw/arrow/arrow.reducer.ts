import { DrawReducer, reorder, DrawState } from '../draw.reducer';
import { PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ArrowProps } from './Arrow';
import { GroupingRectProps } from '../shape/type/GroupingRect';
import { RectProps } from '../shape/type/Rect';
import * as uuid from 'uuid';
import { OdysArrow } from 'generated';
import { ArrowApi } from 'generated/apis/ArrowApi';

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
    const arrow: ArrowProps = {
      ...a,
      type: 'arrow',
      createdAtZoomLevel: 5,
      fromId: a.fromShapeId,
      toId: a.toShapeId,
      isLastUpdatedBySync: false,
      text: '',
    };
    state.shapes[a.id] = arrow;
    //TODO: order should be saved on server.
    reorder(state.shapes, state.drawOrder, arrow);
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
  const existing = Object.values(state.shapes).find((s) => {
    if (s.type === 'arrow') {
      const arrow = s as ArrowProps;
      return arrow.fromId === selectId && arrow.toId === action.payload;
    }
    return false;
  });

  if (existing) {
    return;
  }

  // cannot draw arrow across zoomLevels
  const fromShape = state.shapes[selectId] as RectProps | GroupingRectProps;
  const toShape = state.shapes[action.payload] as RectProps | GroupingRectProps;
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
    fromId: selectId,
    toId: action.payload,
    text: '',
    createdAtZoomLevel: fromShape.createdAtZoomLevel,
    isLastUpdatedBySync: false,
  } as ArrowProps;

  state.shapes[arrow.id] = arrow;
  reorder(state.shapes, state.drawOrder, arrow);
};
