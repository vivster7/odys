import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { CanvasState } from '../canvas.reducer';

interface PanEnd {
  topLeftX: number;
  topLeftY: number;
}

export const endPanFn: CaseReducer<CanvasState, PayloadAction<PanEnd>> = (
  state,
  action
) => {
  state.topLeftX = action.payload.topLeftX;
  state.topLeftY = action.payload.topLeftY;
};
