import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit';

interface MouseMove {
  clickX: number;
  clickY: number;
  svgTopLeftX: number;
  svgTopLeftY: number;
  svgScale: number;
}

interface MouseState {
  x: number;
  y: number;
}

const mouseMoveFn: CaseReducer<MouseState, PayloadAction<MouseMove>> = (
  state,
  action
) => {
  // // Unsure precisely what inverting does.
  // // Attempts to change coordinate plane from client to svg?
  const { clickX, clickY, svgTopLeftX, svgTopLeftY, svgScale } = action.payload;

  const invertX = (clickX - svgTopLeftX) / svgScale;
  const invertY = (clickY - svgTopLeftY) / svgScale;
  // const k = Math.max(0, state.svg.scale * Math.pow(2, action.scaleFactor));

  state.x = invertX;
  state.y = invertY;
};

const mouseSlice = createSlice({
  name: 'mouse',
  initialState: { x: 0, y: 0 } as MouseState,
  reducers: {
    mouseMove: mouseMoveFn,
  },
});

export const { mouseMove } = mouseSlice.actions;
const mouseReducer = mouseSlice.reducer;
export default mouseReducer;
