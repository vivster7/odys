import { DrawState, DrawActionPending, Drawing } from '../draw.reducer';
import { PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { OdysArrow } from 'generated';
import { Selectable } from 'modules/draw/mixins/select/select.reducer';
import { TextEditable } from 'modules/draw/mixins/editText/editText.reducer';
import { Deleteable } from 'modules/draw/mixins/delete/delete.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { Saveable, save } from '../mixins/save/save.reducer';
import { TimeTravelSafeAction } from '../timetravel/timeTravel';
import odysClient from 'global/odysClient';
import { RootState } from 'App';

export interface Arrow extends OdysArrow, ArrowMixins {}
type ArrowMixins = Selectable & TextEditable & Saveable & Deleteable;

export function instanceOfArrow(drawing: Drawing): drawing is Arrow {
  return 'fromShapeId' in drawing && 'toShapeId' in drawing;
}

export function getConnectedArrows(state: DrawState, ids: string[]): Arrow[] {
  return Object.values(state.arrows).filter(
    (a) => ids.includes(a.toShapeId) || ids.includes(a.fromShapeId)
  );
}

export const fetchArrows = createAsyncThunk(
  'draw/fetchArrows',
  async (boardId: string, thunkAPI): Promise<OdysArrow[]> => {
    return odysClient.request('GET', 'OdysArrow', {
      query: `board_id=eq.${boardId}&is_deleted=is.false`,
    });
  }
);

export const fetchArrowsFulfilled = (
  state: DrawState,
  action: PayloadAction<OdysArrow[]>
) => {
  const arrows = action.payload;
  arrows.forEach((a) => {
    const arrow: Arrow = {
      ...a,
      isSavedInDB: true,
      isDeleted: false,
    };
    state.arrows[a.id] = arrow;
    //TODO: order should be saved on server.
    reorder([arrow], state);
  });
};

interface DrawArrow {
  playerId: string;
  id: string;
  fromShapeId: string;
  toShapeId: string;
  boardId: string;
}

export const drawArrow = createAsyncThunk(
  'draw/drawArrow',
  async ({ id }: DrawArrow, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    // if the arrow already existed, then this new `id`
    // wont exist in `state.draw.arrows`
    if (state.draw.arrows[id]) {
      thunkAPI.dispatch(save([id]));
    }
  }
);

export const drawArrowPending: DrawActionPending<DrawArrow> = (
  state,
  action
) => {
  const { playerId, id, fromShapeId, toShapeId, boardId } = action.meta.arg;

  // cannot draw arrow to self.
  if (fromShapeId === toShapeId) {
    return;
  }

  // cannot duplicate existing arrow.
  const existing = Object.values(state.arrows).find((a) => {
    return (
      a.fromShapeId === fromShapeId &&
      a.toShapeId === toShapeId &&
      a.isDeleted === false
    );
  });
  if (existing) {
    reorder([existing], state);
    return;
  }

  // cannot draw arrow across zoomLevels
  const fromShape = state.shapes[fromShapeId];
  const toShape = state.shapes[toShapeId];

  if (!fromShape) throw new Error(`Cannot find shape (${fromShapeId})`);
  if (!toShape) throw new Error(`Cannot find shape (${toShapeId})`);

  const arrow: Arrow = {
    id: id,
    fromShapeId: fromShapeId,
    toShapeId: toShapeId,
    text: '',
    isSavedInDB: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    boardId: boardId,
    isDeleted: false,
  };

  state.arrows[arrow.id] = arrow;
  reorder([arrow], state);

  const undo: TimeTravelSafeAction = {
    actionCreatorName: 'safeDeleteDrawings',
    arg: [id],
  };
  const redo: TimeTravelSafeAction = {
    actionCreatorName: 'safeUpdateDrawings',
    arg: { playerId: playerId, drawings: [arrow] },
  };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};
