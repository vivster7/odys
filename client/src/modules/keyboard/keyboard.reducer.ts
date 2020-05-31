import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { keydown, keydownPendingFn } from './keydown/keydown.reducer';

export interface KeyboardState {
  altKey: boolean;
  shiftKey: boolean;
  cmdKey: boolean;
}

const initialState: KeyboardState = {
  altKey: false,
  shiftKey: false,
  cmdKey: false,
};

export interface KeyEvent {
  code: string;
  metaKey: boolean;
  shiftKey: boolean;
}

const keyboardSlice = createSlice({
  name: 'keyboard',
  initialState: initialState,
  reducers: {
    keyup: (state, action: PayloadAction<KeyEvent>) => {
      const { code, metaKey } = action.payload;
      if (code === 'AltLeft' || code === 'AltRight') state.altKey = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') state.shiftKey = false;
      if (!metaKey) state.cmdKey = false;
    },
    clearKeys: (state, action: PayloadAction<void>) => {
      state.altKey = false;
      state.shiftKey = false;
      state.cmdKey = false;
    },
  },
  extraReducers: {
    [keydown.pending as any]: keydownPendingFn,
    [keydown.fulfilled as any]: (state, action) => {},
    [keydown.rejected as any]: (state, action) => {},
  },
});

export const { keyup, clearKeys } = keyboardSlice.actions;
const keyboardReducer = keyboardSlice.reducer;
export default keyboardReducer;
