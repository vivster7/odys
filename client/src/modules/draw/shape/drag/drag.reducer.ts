import { PayloadAction } from '@reduxjs/toolkit';
import { ShapeReducer, reorder } from '../../draw.reducer';
import { RectProps } from '../type/Rect';

export interface DragState {
  id: string;
  clickX: number;
  clickY: number;
}

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
  const id = action.payload.id;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  state.drag = {
    id: id,
    clickX: action.payload.clickX,
    clickY: action.payload.clickY,
  };

  state.shapes[id].isLastUpdatedBySync = false;
};

export const dragFn: ShapeReducer<PayloadAction<Drag>> = (state, action) => {
  if (!state.drag) {
    throw new Error(
      'Cannot draw/drag without `state.drag` (did draw/startDrag fire first?)'
    );
  }

  const { id } = state.drag;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  const shape = state.shapes[id] as RectProps;
  shape.translateX =
    (action.payload.clickX - state.drag.clickX) / action.payload.scale;
  shape.translateY =
    (action.payload.clickY - state.drag.clickY) / action.payload.scale;
  shape.isLastUpdatedBySync = false;
};

export const endDragFn: ShapeReducer<PayloadAction> = (state, action) => {
  if (!state.drag) {
    throw new Error(
      'Could not end drag action. Was it started with ODYS_START_DRAG_ACTION?'
    );
  }

  const { id } = state.drag;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  const shape = state.shapes[id] as RectProps;
  shape.x = (shape.x as number) + (shape.translateX as number);
  shape.y = (shape.y as number) + (shape.translateY as number);
  shape.translateX = 0;
  shape.translateY = 0;
  shape.isLastUpdatedBySync = false;

  reorder(state.shapes, state.drawOrder, shape);
  state.drag = null;
};
