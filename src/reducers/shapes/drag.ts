import { PayloadAction } from '@reduxjs/toolkit';
import { ShapeReducer, reorder } from './shape';
import { RectProps } from '../../shapes/Rect';

interface StartDrag {
  id: string;
  clickX: number;
  clickY: number;
}

interface Drag {
  clickX: number;
  clickY: number;
  scale: number;
}

export const startDragFn: ShapeReducer<PayloadAction<StartDrag>> = (
  state,
  action
) => {
  state.drag = {
    id: action.payload.id,
    clickX: action.payload.clickX,
    clickY: action.payload.clickY,
  };
};

export const dragFn: ShapeReducer<PayloadAction<Drag>> = (state, action) => {
  if (!state.drag) {
    throw new Error(
      'Cannot shapes/drag without `state.drag` (did shapes/startDrag fire first?)'
    );
  }

  const { id } = state.drag;
  if (!state.data[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  const shape = state.data[id] as RectProps;
  shape.translateX =
    (action.payload.clickX - state.drag.clickX) / action.payload.scale;
  shape.translateY =
    (action.payload.clickY - state.drag.clickY) / action.payload.scale;
};

export const endDragFn: ShapeReducer<PayloadAction> = (state, action) => {
  if (!state.drag) {
    throw new Error(
      'Could not end drag action. Was it started with ODYS_START_DRAG_ACTION?'
    );
  }

  const { id } = state.drag;
  if (!state.data[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  const shape = state.data[id] as RectProps;
  shape.x = (shape.x as number) + (shape.translateX as number);
  shape.y = (shape.y as number) + (shape.translateY as number);
  shape.translateX = 0;
  shape.translateY = 0;

  reorder(state.data, state.shapeOrder, shape);
  state.drag = null;
};
