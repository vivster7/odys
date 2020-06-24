import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { OdysBoard } from 'generated';
import odysClient from 'global/odysClient';

type LoadStates = 'loading' | 'success' | 'failed';

interface BoardState {
  id: string;
  roomId: string;
  loaded: LoadStates;
  isFeedbackOpen: boolean;
}

export const getOrCreateBoard = createAsyncThunk(
  'board/getOrCreateBoard',
  async (roomId: string, thunkAPI): Promise<OdysBoard> => {
    const response = await odysClient.request('POST', 'OdysBoard', {
      queryOpts: {
        onConflict: ['room_id'],
        select: ['id', 'room_id'],
      },
      headerOpts: {
        mergeDuplicates: true,
        returnRepresentation: true,
      },
      body: [{ roomId: roomId }],
    });

    if (response.length !== 1) {
      throw new Error(`Could not getOrCreate one board. roomId: ${roomId}`);
    }
    return response[0];
  }
);

export const saveFeedback = createAsyncThunk(
  'board/saveFeedback',
  async (feedback: string, thunkAPI) => {
    // const response = await odysClient.request('POST', 'OdysBoard', {
    //   queryOpts: {
    //     onConflict: ['room_id'],
    //     select: ['id', 'room_id'],
    //   },
    //   headerOpts: {
    //     mergeDuplicates: true,
    //     returnRepresentation: true,
    //   },
    //   body: [{ roomId: roomId }],
    // });
    // if (response.length !== 1) {
    //   throw new Error(`Could not getOrCreate one board. roomId: ${roomId}`);
    // }
    // return response[0];
  }
);

const initialState: BoardState = {
  id: '',
  roomId: '',
  loaded: 'loading',
  isFeedbackOpen: false,
};

const boardSlice = createSlice({
  name: 'board',
  initialState: initialState,
  reducers: {
    openFeedback: (state, action: PayloadAction<void>) => {
      state.isFeedbackOpen = true;
    },
    closeFeedback: (state, action: PayloadAction<void>) => {
      state.isFeedbackOpen = false;
    },
  },
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
      state.roomId = action.payload.roomId;
    },
    [getOrCreateBoard.rejected as any]: (state, action) => {
      state.loaded = 'failed';
    },
    [saveFeedback.pending as any]: (state, action) => {},
    [saveFeedback.fulfilled as any]: (state, action) => {},
    [saveFeedback.rejected as any]: (state, action) => {},
  },
});

export const { openFeedback, closeFeedback } = boardSlice.actions;
const boardReducer = boardSlice.reducer;
export default boardReducer;
