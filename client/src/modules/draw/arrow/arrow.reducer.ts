import { DrawReducer, DrawState } from '../draw.reducer';
import { PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as uuid from 'uuid';
import { OdysArrow } from 'generated';
import { ArrowApi } from 'generated/apis/ArrowApi';
import { Syncable } from '../mixins/sync/sync';
import { Selectable } from 'modules/draw/mixins/select/select.reducer';
import { TextEditable } from 'modules/draw/mixins/editText/editText.reducer';

export interface Arrow extends OdysArrow, ArrowMixins {}
type ArrowMixins = Selectable & TextEditable & Syncable;

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
      isLastUpdatedBySync: false,
    };
    state.arrows[a.id] = arrow;
    //TODO: order should be saved on server.
    state.drawOrder.push(arrow.id);
  });
};

interface DrawArrow {
  id: string;
  boardId: string;
}
export const drawArrowFn: DrawReducer<DrawArrow> = (state, action) => {
  if (!state.select) {
    throw new Error('Cannot draw arrow without selected object.');
  }

  const { id, boardId } = action.payload;
  const selectId = state.select.id;

  // cannot draw arrow to self.
  if (id === selectId) {
    return;
  }

  // cannot duplicate existing arrow.
  const existing = Object.values(state.arrows).find(
    (a) => a.fromShapeId === selectId && a.toShapeId === id
  );

  if (existing) {
    return;
  }

  // cannot draw arrow across zoomLevels
  const fromShape = state.shapes[selectId];
  const toShape = state.shapes[id];
  if (!fromShape) throw new Error(`Cannot find shape (${selectId})`);
  if (!toShape) throw new Error(`Cannot find shape (${id})`);
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
    toShapeId: id,
    text: '',
    isLastUpdatedBySync: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    boardId: boardId,
  };

  state.arrows[arrow.id] = arrow;
  state.drawOrder.push(arrow.id);
};
