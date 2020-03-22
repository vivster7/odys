import { GlobalActionType, GlobalState, Anchor } from '../globals';
import { RectProps } from '../shapes/Rect';

export interface OdysStartResizeAction extends GlobalActionType {
  type: 'ODYS_START_RESIZE_ACTION';
  id: string;
  anchor: Anchor;
  originalX: number;
  originalY: number;
}

export interface OdysResizeAction extends GlobalActionType {
  type: 'ODYS_RESIZE_ACTION';
  clickX: number;
  clickY: number;
}

export interface OdysEndResizeAction extends GlobalActionType {
  type: 'ODYS_END_RESIZE_ACTION';
}

const resizeReducerMap = {
  ODYS_START_RESIZE_ACTION: onOdysStartResizeAction,
  ODYS_RESIZE_ACTION: onOdysResizeAction,
  ODYS_END_RESIZE_ACTION: onOdysEndResizeAction
};

export default resizeReducerMap;
function onOdysStartResizeAction(
  state: GlobalState,
  action: OdysStartResizeAction
): GlobalState {
  return {
    ...state,
    resize: {
      id: action.id,
      anchor: action.anchor,
      originalX: action.originalX,
      originalY: action.originalY,
      clickX: 0,
      clickY: 0
    }
  };
}

function onOdysResizeAction(
  state: GlobalState,
  action: OdysResizeAction
): GlobalState {
  if (state.resize) {
    const { id } = state.resize;
    const { shapes } = state;
    const idx = shapes.findIndex(d => d.id === id);
    if (idx === -1) {
      throw new Error(`[resize] Cannot find ${id} in shapes`);
    }

    const shape = {
      ...shapes[idx],
      deltaWidth: (action.clickX - state.resize.originalX) / state.svg.scale,
      deltaHeight: (action.clickY - state.resize.originalY) / state.svg.scale
    };

    return {
      ...state,
      shapes: [...shapes.slice(0, idx), ...shapes.slice(idx + 1), ...[shape]]
    };
  }

  throw new Error(
    'Cannot ODYS_RESIZE_ACTION without `state.resize` (did ODYS_START_RESIZE_ACTION fire first?)'
  );
}

function onOdysEndResizeAction(
  state: GlobalState,
  action: OdysEndResizeAction
): GlobalState {
  if (state.resize) {
    const { shapes } = state;
    const { id } = state.resize;
    const idx = shapes.findIndex(s => s.id === id);
    if (idx === -1) {
      throw new Error(`[resize] Cannot find ${id} in shapes`);
    }

    const rect = shapes[idx] as RectProps;
    const shape = {
      ...rect,
      width: rect.width + rect.deltaWidth,
      height: rect.height + rect.deltaHeight,
      deltaWidth: 0,
      deltaHeight: 0
    };

    return {
      ...state,
      drag: null,
      newRectByClick: null,
      pan: null,
      resize: null,
      shapes: [...shapes.slice(0, idx), ...shapes.slice(idx + 1), ...[shape]]
    };
  }

  throw new Error(
    'Could not end resize shape action. Was it started with ODYS_START_RESIZE_ACTION?'
  );
}
