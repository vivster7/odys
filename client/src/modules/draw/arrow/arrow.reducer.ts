import {
  DrawState,
  reorder,
  DrawActionPending,
  DrawActionFulfilled,
  DrawActionRejected,
} from '../draw.reducer';
import { PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { OdysArrow, Configuration } from 'generated';
import { ArrowApi } from 'generated/apis/ArrowApi';
import { Syncable } from '../mixins/sync/sync';
import { Selectable } from 'modules/draw/mixins/select/select.reducer';
import { TextEditable } from 'modules/draw/mixins/editText/editText.reducer';
import { Deleteable } from 'modules/draw/mixins/delete/delete';
import { RootState } from 'App';

export interface Arrow extends OdysArrow, ArrowMixins {}
type ArrowMixins = Selectable & TextEditable & Syncable & Deleteable;

export function instanceOfArrow(object: any): object is Arrow {
  return 'fromShapeId' in object && 'toShapeId' in object;
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
      isLastUpdatedBySync: false,
      isSavedInDB: true,
      deleted: false,
    };
    state.arrows[a.id] = arrow;
    //TODO: order should be saved on server.
    reorder(arrow, state);
  });
};

interface DrawArrow {
  id: string;
  fromShapeId: string;
  toShapeId: string;
  boardId: string;
}

export const drawArrow = createAsyncThunk(
  'draw/drawArrow',
  async (arg: DrawArrow, thunkAPI) => {
    const { id } = arg;
    const state = thunkAPI.getState() as RootState;
    const arrow = state.draw.arrows[id];
    if (!arrow) {
      throw new Error(`Cannot find arrow ${id}`);
    }

    const api = new ArrowApi(
      new Configuration({ headers: { Prefer: 'resolution=merge-duplicates' } })
    );
    await api.arrowPost({ arrow: arrow });
  }
);

export const drawArrowPending: DrawActionPending<DrawArrow> = (
  state,
  action
) => {
  const { id, fromShapeId, toShapeId, boardId } = action.meta.arg;

  // cannot draw arrow to self.
  if (fromShapeId === toShapeId) {
    return;
  }

  // cannot duplicate existing arrow.
  const existing = Object.values(state.arrows).find(
    (a) => a.fromShapeId === fromShapeId && a.toShapeId === toShapeId
  );
  if (existing) {
    return;
  }

  // cannot draw arrow across zoomLevels
  const fromShape = state.shapes[fromShapeId];
  const toShape = state.shapes[toShapeId];
  if (!fromShape) throw new Error(`Cannot find shape (${fromShapeId})`);
  if (!toShape) throw new Error(`Cannot find shape (${toShapeId})`);
  if (fromShape.createdAtZoomLevel !== toShape.createdAtZoomLevel) {
    throw new Error(
      `Cannot draw arrow across zoomLevel (createdAtZoomLevels dont match)`
    );
  }

  const arrow = {
    type: 'arrow',
    id: id,
    fromShapeId: fromShapeId,
    toShapeId: toShapeId,
    text: '',
    isLastUpdatedBySync: false,
    isSavedInDB: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    boardId: boardId,
    deleted: false,
  };

  state.arrows[arrow.id] = arrow;
  reorder(arrow, state);
};

export const drawArrowFulfilled: DrawActionFulfilled<DrawArrow> = (
  state,
  action
) => {
  const { id } = action.meta.arg;
  const arrow = state.arrows[id];
  arrow.isSavedInDB = true;
};
export const drawArrowRejected: DrawActionRejected<DrawArrow> = (
  state,
  action
) => {
  const { id } = action.meta.arg;
  const arrow = state.arrows[id];
  arrow.isSavedInDB = false;
};
