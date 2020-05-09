import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { SVGState } from '../svg.reducer';

interface PanEnd {
  topLeftX: number;
  topLeftY: number;
}

export const endPanFn: CaseReducer<SVGState, PayloadAction<PanEnd>> = (
  state,
  action
) => {
  state.topLeftX = action.payload.topLeftX;
  state.topLeftY = action.payload.topLeftY;
};
