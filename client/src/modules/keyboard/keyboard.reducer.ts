import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { keydown, keydownPendingFn } from './keydown/keydown.reducer';

export interface KeyboardState {
  altKey: boolean;
  shiftKey: boolean;
  cmdKey: boolean;
  spaceKey: boolean;
}

const initialState: KeyboardState = {
  altKey: false,
  shiftKey: false,
  cmdKey: false,
  spaceKey: false,
};

export interface KeyEvent {
  key: string;
  altKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  repeat: boolean;
}

const keyboardSlice = createSlice({
  name: 'keyboard',
  initialState: initialState,
  reducers: {
    keyup: (state, action: PayloadAction<KeyEvent>) => {
      const { key, altKey, shiftKey, metaKey } = action.payload;
      if (!altKey) state.altKey = false;
      if (!shiftKey) state.shiftKey = false;
      if (!metaKey) state.cmdKey = false;
      if (key === ' ') state.spaceKey = false;
    },
    clearKeys: (state, action: PayloadAction<void>) => {
      state.altKey = false;
      state.shiftKey = false;
      state.cmdKey = false;
      state.spaceKey = false;
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
