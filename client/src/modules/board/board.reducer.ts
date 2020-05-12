import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { OdysBoard, OdysBoardFromJSON } from 'generated';

type LoadStates = 'loading' | 'success' | 'failed';

interface BoardState {
  id: string;
  room_id: string;
  loaded: LoadStates;
}

export const getOrCreateBoard = createAsyncThunk(
  'board/getOrCreateBoard',
  async (roomId: string, thunkAPI): Promise<OdysBoard> => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/vnd.pgrst.object+json');
    headers.append('Prefer', 'resolution=merge-duplicates');
    headers.append('Prefer', 'return=representation');

    // not using generated client, missing support for on_conflict.
    const url =
      'http://localhost:3001/board?on_conflict=room_id&select=id,room_id';
    const p = await fetch(url, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({
        room_id: roomId,
      }),
    });

    return OdysBoardFromJSON(await p.json());
  }
);

const initialState: BoardState = {
  id: '',
  room_id: '',
  loaded: 'loading',
};

const boardSlice = createSlice({
  name: 'board',
  initialState: initialState,
  reducers: {},
  extraReducers: {
    [getOrCreateBoard.pending as any]: (state, action) => {
      state.loaded = 'loading';
    },
    [getOrCreateBoard.fulfilled as any]: (
      state,
      action: PayloadAction<OdysBoard>
    ) => {
      state.loaded = 'success';
      state.id = action.payload.id;
      state.room_id = action.payload.roomId;
    },
    [getOrCreateBoard.rejected as any]: (state, action) => {
      state.loaded = 'failed';
    },
  },
});

// export const { } = boardSlice.actions;
const boardReducer = boardSlice.reducer;
export default boardReducer;
