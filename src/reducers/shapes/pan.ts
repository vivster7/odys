import { PayloadAction } from '@reduxjs/toolkit';
import { ShapeReducer } from './shape';

interface StartPan {
  clickX: number;
  clickY: number;
}

interface Pan {
  clickX: number;
  clickY: number;
}

export const startPanFn: ShapeReducer<PayloadAction<StartPan>> = (
  state,
  action
) => {
  state.select = null;
  state.pan = {
    clickX: action.payload.clickX,
    clickY: action.payload.clickY,
  };
};

export const panFn: ShapeReducer<PayloadAction<Pan>> = (state, action) => {
  if (!state.pan) {
    throw new Error(
      'Cannot ODYS_PAN_ACTION without `state.pan` (did ODYS_START_PAN_ACTION fire first?)'
    );
  }

  state.svg.translateX = action.payload.clickX - state.pan.clickX;
  state.svg.translateY = action.payload.clickY - state.pan.clickY;
};

export const endPanFn: ShapeReducer<PayloadAction> = (state, action) => {
  if (!state.pan) {
    throw new Error(
      'Could not end pan action. Was it started with ODYS_START_PAN_ACTION?'
    );
  }

  state.drag = null;
  state.newRectByClick = null;
  state.pan = null;
  state.svg.topLeftX = state.svg.topLeftX + state.svg.translateX;
  state.svg.topLeftY = state.svg.topLeftY + state.svg.translateY;
  state.svg.translateX = 0;
  state.svg.translateY = 0;
};
