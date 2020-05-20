import { DrawActionPending } from 'modules/draw/draw.reducer';
import { TimeTravelSafeAction } from 'modules/draw/timetravel/timeTravel';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { save } from '../save/save.reducer';

interface EndMultiDrag {
  ids: string[];
  translateX: number;
  translateY: number;
}

export const endMultiDrag = createAsyncThunk(
  'draw/endMultiDrag',
  async ({ ids }: EndMultiDrag, thunkAPI) => {
    thunkAPI.dispatch(save(ids));
  }
);

export const endMultiDragPending: DrawActionPending<EndMultiDrag> = (
  state,
  action
) => {
  const { ids, translateX, translateY } = action.meta.arg;

  const shapes = ids.map((id) => state.shapes[id]);

  const shapesSnapshot = shapes.map((s) => Object.assign({}, s));
  shapes.forEach((s) => {
    s.x += translateX;
    s.y += translateY;
  });
  if (state.multiSelect) {
    state.multiSelect.outline.x += translateX;
    state.multiSelect.outline.y += translateY;
  }

  const undo: TimeTravelSafeAction = {
    actionCreatorName: 'safeUpdateDrawings',
    arg: shapesSnapshot,
  };
  const redo: TimeTravelSafeAction = {
    actionCreatorName: 'safeUpdateDrawings',
    arg: shapes,
  };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};
