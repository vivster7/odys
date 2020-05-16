import { DrawState, DrawActionPending, Drawing } from '../draw.reducer';
import { PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { OdysArrow } from 'generated';
import { ArrowApi } from 'generated/apis/ArrowApi';
import { Syncable } from '../mixins/sync/sync';
import { Selectable } from 'modules/draw/mixins/select/select.reducer';
import { TextEditable } from 'modules/draw/mixins/editText/editText.reducer';
import { Deleteable } from 'modules/draw/mixins/delete/delete.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { Saveable, save } from '../mixins/save/save.reducer';

export interface Arrow extends OdysArrow, ArrowMixins {}
type ArrowMixins = Selectable & TextEditable & Syncable & Saveable & Deleteable;

export function instanceOfArrow(drawing: Drawing): drawing is Arrow {
  return 'fromShapeId' in drawing && 'toShapeId' in drawing;
}

export const getArrows = createAsyncThunk(
  'draw/getArrows',
  async (boardId: string, thunkAPI): Promise<OdysArrow[]> => {
    const api = new ArrowApi();
    return api.arrowGet({
      boardId: `eq.${boardId}`,
      isDeleted: ('is.false' as any) as boolean,
    });
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
      isLastUpdatedBySync: true,
      isSavedInDB: true,
      isDeleted: false,
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
  async ({ id }: DrawArrow, thunkAPI) => {
    thunkAPI.dispatch(save([id]));
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
    isSavedInDB: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    boardId: boardId,
    isDeleted: false,
  };

  state.arrows[arrow.id] = arrow;
  reorder(arrow, state);

  const undo = { actionCreatorName: 'safeDeleteDrawing', arg: id };
  const redo = { actionCreatorName: 'safeUpdateDrawings', arg: [arrow] };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};
