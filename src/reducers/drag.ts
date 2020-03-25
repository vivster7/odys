import { GlobalActionType, GlobalState } from '../globals';

export interface OdysStartDragAction extends GlobalActionType {
  type: 'ODYS_START_DRAG_ACTION';
  id: string;
  clickX: number;
  clickY: number;
}

export interface OdysDragAction extends GlobalActionType {
  type: 'ODYS_DRAG_ACTION';
  clickX: number;
  clickY: number;
}

export interface OdysEndDragAction extends GlobalActionType {
  type: 'ODYS_END_DRAG_ACTION';
}

const dragReducerMap = {
  ODYS_START_DRAG_ACTION: onOdysStartDragAction,
  ODYS_DRAG_ACTION: onOdysDragAction,
  ODYS_END_DRAG_ACTION: onOdysEndDragAction
};

export default dragReducerMap;

function onOdysStartDragAction(
  state: GlobalState,
  action: OdysStartDragAction
): GlobalState {
  return {
    ...state,
    drag: {
      id: action.id,
      clickX: action.clickX,
      clickY: action.clickY
    }
  };
}

function onOdysDragAction(
  state: GlobalState,
  action: OdysDragAction
): GlobalState {
  if (state.drag) {
    const { id } = state.drag;
    const { shapes } = state;
    const idx = shapes.findIndex(d => d.id === id);
    if (idx === -1) {
      throw new Error(`[drag] Cannot find ${id} in shapes context`);
    }

    const shape = {
      ...shapes[idx],
      translateX: (action.clickX - state.drag.clickX) / state.svg.scale,
      translateY: (action.clickY - state.drag.clickY) / state.svg.scale
    };

    return {
      ...state,
      shapes: [...shapes.slice(0, idx), ...shapes.slice(idx + 1), ...[shape]]
    };
  }

  throw new Error(
    'Cannot ODYS_DRAG_ACTION without `state.drag` (did ODYS_START_DRAG_ACTION fire first?)'
  );
}

function onOdysEndDragAction(
  state: GlobalState,
  action: OdysEndDragAction
): GlobalState {
  if (state.drag) {
    const { shapes } = state;
    const { id } = state.drag;
    const idx = shapes.findIndex(s => s.id === id);
    if (idx === -1) {
      throw new Error(`[drag] Cannot find ${id} in shapes`);
    }

    const shape = {
      ...shapes[idx],
      x: (shapes[idx].x as number) + (shapes[idx].translateX as number),
      y: (shapes[idx].y as number) + (shapes[idx].translateY as number),
      translateX: 0,
      translateY: 0
    };

    return {
      ...state,
      drag: null,
      newRectByClick: null,
      pan: null,
      shapes: [...shapes.slice(0, idx), ...shapes.slice(idx + 1), ...[shape]]
    };
  }

  throw new Error(
    'Could not end drag action. Was it started with ODYS_START_DRAG_ACTION?'
  );
}
