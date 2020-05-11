import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

type LoadStates = 'loading' | 'success' | 'failed';

interface BoardState {
  id: string;
  room_id: string;
  loaded: LoadStates;
}

interface BoardResponse {
  id: string;
  room_id: string;
}

export const getOrCreateBoard = createAsyncThunk(
  'board/getOrCreateBoard',
  async (roomId: string, thunkAPI): Promise<BoardResponse> => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Prefer', 'resolution=merge-duplicates');
    headers.append('Prefer', 'return=representation');

    const url =
      'http://localhost:3001/boards?on_conflict=room_id&select=id,room_id';
    const p = await fetch(url, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({
        room_id: roomId,
      }),
    });

    const result = await p.json();
    return { id: result.id, room_id: result.room_id };
  }
);

const boardSlice = createSlice({
  name: 'board',
  initialState: {
    id: '',
    room_id: '',
    position: 0,
    loaded: 'loading',
  } as BoardState,
  reducers: {},
  extraReducers: {
    [getOrCreateBoard.pending as any]: (state, action) => {
      state.loaded = 'loading';
    },
    [getOrCreateBoard.fulfilled as any]: (
      state,
      action: PayloadAction<BoardResponse>
    ) => {
      state.loaded = 'success';
      state.id = action.payload.id;
      state.room_id = action.payload.room_id;
    },
    [getOrCreateBoard.rejected as any]: (state, action) => {
      state.loaded = 'failed';
    },
  },
});

// export const { } = boardSlice.actions;
const boardReducer = boardSlice.reducer;
export default boardReducer;
