import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'App';
import { DrawActionFulfilled } from '../draw.reducer';
import { actionCreatorMap } from './timeTravel';

export const redo: any = createAsyncThunk(
  'draw/redo',
  async (_: void, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;

    const redos = state.draw.timetravel.redos;
    if (redos.length > 0) {
      const { redo } = redos[0];
      const { actionCreatorName, arg } = redo;
      const actionCreator: any = actionCreatorMap[actionCreatorName];
      thunkAPI.dispatch(await actionCreator(arg));
      return;
    }

    throw new Error('Cannot redo; redo buffer is empty');
  },
  {
    condition: (_: void, thunkAPI) => {
      const state = thunkAPI.getState() as RootState;
      return state.draw.timetravel.redos.length > 0;
    },
  }
);

export const redoFulfilled: DrawActionFulfilled<void> = (state, action) => {
  const undoredo = state.timetravel.redos.pop()!;
  state.timetravel.undos.push(undoredo);
};
