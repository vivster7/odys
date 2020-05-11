import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Room, RoomFromJSON } from 'generated/models/Room';

type LoadStates = 'loading' | 'success' | 'failed';

interface RoomState {
  id: string;
  loaded: LoadStates;
}

export const getOrCreateRoom = createAsyncThunk(
  'room/getOrCreateRoom',
  async (id: string, thunkAPI): Promise<Room> => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Prefer', 'return=representation');
    headers.append('Prefer', 'resolution=merge-duplicates');
    headers.append('Accept', 'application/vnd.pgrst.object+json');

    const url = 'http://localhost:3001/rooms?on_conflict=id&select=id';
    const p = await fetch(url, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({
        id: id,
      }),
    });

    const result = await p.json();
    return RoomFromJSON(result);
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
      action: PayloadAction<Room>
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
