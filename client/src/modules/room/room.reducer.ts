import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { OdysRoom } from 'generated';
import odysClient from 'global/odysClient';

type LoadStates = 'loading' | 'success' | 'failed';

interface RoomState {
  id: string;
  loaded: LoadStates;
}

export const getOrCreateRoom = createAsyncThunk(
  'room/getOrCreateRoom',
  async (id: string, thunkAPI): Promise<OdysRoom> => {
    const response = await odysClient.request('POST', 'OdysRoom', {
      queryOpts: {
        onConflict: ['id'],
        select: ['id'],
      },
      headerOpts: {
        mergeDuplicates: true,
        returnRepresentation: true,
      },
      body: [{ id: id }],
    });

    if (response.length !== 1) {
      throw new Error(`Could not getOrCreate one room. id: ${id}`);
    }
    return response[0];
  }
);

const initialState: RoomState = { id: '', loaded: 'loading' };

const roomSlice = createSlice({
  name: 'room',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    [getOrCreateRoom.pending as any]: (state, action) => {
      state.loaded = 'loading';
    },
    [getOrCreateRoom.fulfilled as any]: (
      state,
      action: PayloadAction<OdysRoom>
    ) => {
      state.loaded = 'success';
      state.id = action.payload.id;
    },
    [getOrCreateRoom.rejected as any]: (state, action) => {
      state.loaded = 'failed';
    },
  },
});

// export const { } = roomSlice.actions;
const roomReducer = roomSlice.reducer;
export default roomReducer;
