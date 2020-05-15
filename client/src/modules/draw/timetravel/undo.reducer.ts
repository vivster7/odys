import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'App';
import { DrawActionFulfilled } from '../draw.reducer';
import { actionCreatorMap } from './timeTravel';

export const undo: any = createAsyncThunk(
  'draw/undo',
  async (_: void, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;

    const undos = state.draw.timetravel.undos;
    if (undos.length > 0) {
      const { undo } = undos[0];
      const { actionCreatorName, arg } = undo;
      const actionCreator: any = actionCreatorMap[actionCreatorName];
      thunkAPI.dispatch(await actionCreator(arg));
      return;
    }

    throw new Error('Cannot undo; undo buffer is empty');
  },
  {
    condition: (_: void, thunkAPI) => {
      const state = thunkAPI.getState() as RootState;
      return state.draw.timetravel.undos.length > 0;
    },
  }
);

export const undoFulfilled: DrawActionFulfilled<void> = (state, action) => {
  const undoredo = state.timetravel.undos.pop()!;
  state.timetravel.redos.push(undoredo);
};
