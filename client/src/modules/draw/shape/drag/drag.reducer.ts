import { DrawReducer, reorder } from '../../draw.reducer';

export interface DragState {
  id: string;
  clickX: number;
  clickY: number;
}

export interface Draggable {
  id: string;
  x: number;
  y: number;
  translateX: number;
  translateY: number;
}

interface Drag {
  clickX: number;
  clickY: number;
  scale: number;
}

export const startDragFn: DrawReducer<DragState> = (state, action) => {
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

export const dragFn: DrawReducer<Drag> = (state, action) => {
  if (!state.drag) {
    throw new Error(
      'Cannot draw/drag without `state.drag` (did draw/startDrag fire first?)'
    );
  }

  const { id } = state.drag;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  const shape = state.shapes[id];
  shape.translateX =
    (action.payload.clickX - state.drag.clickX) / action.payload.scale;
  shape.translateY =
    (action.payload.clickY - state.drag.clickY) / action.payload.scale;
  shape.isLastUpdatedBySync = false;
};

export const endDragFn: DrawReducer = (state, action) => {
  if (!state.drag) {
    throw new Error(
      'Could not end drag action. Was it started with ODYS_START_DRAG_ACTION?'
    );
  }

  const { id } = state.drag;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  const shape = state.shapes[id];
  shape.x = (shape.x as number) + (shape.translateX as number);
  shape.y = (shape.y as number) + (shape.translateY as number);
  shape.translateX = 0;
  shape.translateY = 0;
  shape.isLastUpdatedBySync = false;

  reorder(shape, state);
  state.drag = null;
};
