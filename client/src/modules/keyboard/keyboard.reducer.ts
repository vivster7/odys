import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { keydown, keydownPendingFn } from './keydown/keydown.reducer';

export interface KeyboardState {
  altKey: boolean;
  shiftKey: boolean;
}

const initialState: KeyboardState = {
  altKey: false,
  shiftKey: false,
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
      const { code } = action.payload;
      if (code === 'AltLeft' || code === 'AltRight') state.altKey = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') state.shiftKey = false;
    },
  },
  extraReducers: {
    [keydown.pending as any]: keydownPendingFn,
    [keydown.fulfilled as any]: (state, action) => {},
    [keydown.rejected as any]: (state, action) => {},
  },
});

export const { keyup } = keyboardSlice.actions;
const keyboardReducer = keyboardSlice.reducer;
export default keyboardReducer;
