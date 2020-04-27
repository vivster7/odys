import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ErrorsState {
  data: OdysError[];
}

export interface OdysError {
  message: string;
}

const initialState: ErrorsState = {
  data: [],
};

const errorsSlice = createSlice({
  name: 'errors',
  initialState: initialState,
  reducers: {
    addError: (state: ErrorsState, action: PayloadAction<string>) => {
      const error = { message: action.payload };
      state.data.push(error);
    },
    clearErrors: (state: ErrorsState, action: PayloadAction) => {
      state.data = [];
    },
  },
});

export const { addError, clearErrors } = errorsSlice.actions;
const errorReducer = errorsSlice.reducer;
export default errorReducer;
