import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { OdysRoom, OdysRoomFromJSON } from 'generated';

type LoadStates = 'loading' | 'success' | 'failed';

interface RoomState {
  id: string;
  loaded: LoadStates;
}

export const getOrCreateRoom = createAsyncThunk(
  'room/getOrCreateRoom',
  async (id: string, thunkAPI): Promise<OdysRoom> => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Prefer', 'return=representation');
    headers.append('Prefer', 'resolution=merge-duplicates');
    headers.append('Accept', 'application/vnd.pgrst.object+json');

    // not using generated client, missing support for on_conflict.
    const url = 'http://localhost:3001/room?on_conflict=id&select=id';
    const p = await fetch(url, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({
        id: id,
      }),
    });

    return OdysRoomFromJSON(await p.json());
  }
);

const roomSlice = createSlice({
  name: 'room',
  initialState: { id: '', loaded: 'loading' } as RoomState,
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
