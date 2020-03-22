import React, { Dispatch } from 'react';
import Shape from './shapes/Shape';
import { v4 } from 'uuid';
import { RectProps, RECT_HEIGHT, RECT_WIDTH } from './shapes/Rect';

export type NEAnchor = 'NEAnchor';
export type NWAnchor = 'NWAnchor';
export type SEAnchor = 'SEAnchor';
export type SWAnchor = 'SWAnchor';
export type Anchor = NEAnchor | NWAnchor | SEAnchor | SWAnchor;

const uid = () => `id-${v4()}`;
export interface GlobalState {
  shapes: Shape[];
  drag: DragState | null;
  pan: PanState | null;
  resizeShape: ResizeShapeState | null;
  selectedId: string | null;
  newRectByClick: NewRectByClickState | null;
  svg: SVGState;
}

interface DragState {
  id: string;
  clickX: number;
  clickY: number;
}

interface PanState {
  clickX: number;
  clickY: number;
}

interface ResizeShapeState {
  id: string;
  anchor: Anchor;
  originalX: number;
  originalY: number;
  clickX: number;
  clickY: number;
}

interface NewRectByClickState {
  clickX: number;
  clickY: number;
}

interface SVGState {
  topLeftX: number;
  topLeftY: number;
  translateX: number;
  translateY: number;
  scale: number;
}

export interface GlobalActionType {
  type: string;
}

export interface OdysRaiseShapeAction extends GlobalActionType {
  type: 'ODYS_RAISE_SHAPE_ACTION';
  id: string;
}

export interface OdysAddShapeAction extends GlobalActionType {
  type: 'ODYS_ADD_SHAPE_ACTION';
  shape: Shape;
}

export interface OdysDeleteShapeAction extends GlobalActionType {
  type: 'ODYS_DELETE_SHAPE_ACTION';
  id: string;
}

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

export interface OdysStartPanAction extends GlobalActionType {
  type: 'ODYS_START_PAN_ACTION';
  clickX: number;
  clickY: number;
}

export interface OdysPanAction extends GlobalActionType {
  type: 'ODYS_PAN_ACTION';
  clickX: number;
  clickY: number;
}

export interface OdysEndPanAction extends GlobalActionType {
  type: 'ODYS_END_PAN_ACTION';
}

export interface OdysStartNewRectByClickAction extends GlobalActionType {
  type: 'ODYS_START_NEW_RECT_BY_CLICK_ACTION';
  clickX: number;
  clickY: number;
}

export interface OdysEndNewRectByClickAction extends GlobalActionType {
  type: 'ODYS_END_NEW_RECT_BY_CLICK_ACTION';
  clickX: number;
  clickY: number;
}

export interface OdysStartResizeShapeAction extends GlobalActionType {
  type: 'ODYS_START_RESIZE_SHAPE_ACTION';
  id: string;
  anchor: Anchor;
  originalX: number;
  originalY: number;
}

export interface OdysResizeShapeAction extends GlobalActionType {
  type: 'ODYS_RESIZE_SHAPE_ACTION';
  clickX: number;
  clickY: number;
}

export interface OdysEndResizeShapeAction extends GlobalActionType {
  type: 'ODYS_END_RESIZE_SHAPE_ACTION';
}

export interface OdysSelectAction extends GlobalActionType {
  type: 'ODYS_SELECT_ACTION';
  id: string;
}

export interface OdysSelectedShapeInputChangeAction extends GlobalActionType {
  type: 'ODYS_SELECTED_SHAPE_INPUT_CHANGE_ACTION';
  id: string;
  text: string;
}

export interface OdysWheelAction extends GlobalActionType {
  type: 'ODYS_WHEEL_ACTION';
  clickX: number;
  clickY: number;
  scaleFactor: number;
}

export type GlobalAction =
  | OdysRaiseShapeAction
  | OdysAddShapeAction
  | OdysDeleteShapeAction
  | OdysStartNewRectByClickAction
  | OdysEndNewRectByClickAction
  | OdysStartDragAction
  | OdysDragAction
  | OdysEndDragAction
  | OdysStartPanAction
  | OdysPanAction
  | OdysEndPanAction
  | OdysStartResizeShapeAction
  | OdysResizeShapeAction
  | OdysEndResizeShapeAction
  | OdysSelectAction
  | OdysWheelAction
  | OdysSelectedShapeInputChangeAction;

export const GlobalStateContext = React.createContext({
  globalState: {} as GlobalState,
  dispatch: ((): never => {
    throw new Error(
      'dispatch function missing. Is a GlobalStateContext.Provider loaded above calling component?'
    );
  }) as Dispatch<GlobalAction>
});

export function globalStateReducer(state: GlobalState, action: GlobalAction) {
  console.log(action.type);
  // const m = {
  //   'ODYS_RAISE_SHAPE_ACTION': onOdysRaiseShape(state, action as any),
  //   'ODYS_ADD_SHAPE_ACTION': onOdysAddShapeAction(state, action as any),
  //   'ODYS_DELETE_SHAPE_ACTION': onOdysDeleteShapeAction(state, action as any),
  //   'ODYS_START_DRAG_ACTION': onOdysStartDragAction(state, action as any),
  //   'ODYS_START_PAN_ACTION': onOdysStartPanAction(state, action as any),
  //   'ODYS_START_RESIZE_SHAPE_ACTION': onOdysStartResizeShapeAction(state, action as any),
  //   'ODYS_SELECT_ACTION': onOdysSelectAction(state, action as any),
  //   'ODYS_START_NEW_RECT_BY_CLICK_ACTION': onOdysStartNewRectByClickAction(state, action as any),
  //   'ODYS_SELECTED_SHAPE_INPUT_CHANGE_ACTION': onOdysSelectedShapeInputChangeAction(state, action as any),
  //   'ODYS_END_NEW_RECT_BY_CLICK_ACTION': onOdysEndNewRectByClickAction(state, action as any),
  //   'ODYS_DRAG_ACTION': onOdysDragAction(state, action as any),
  //   'ODYS_END_DRAG_ACTION': onOdysEndDragAction(state, action as any),
  //   'ODYS_PAN_ACTION': onOdysPanAction(state, action as any),
  //   'ODYS_END_PAN_ACTION': onOdysEndPanAction(state, action as any),
  //   'ODYS_RESIZE_SHAPE_ACTION': onOdysResizeShapeAction(state, action as any),
  //   'ODYS_END_RESIZE_SHAPE_ACTION': onOdysEndResizeShapeAction(state, action as any),
  //   'ODYS_WHEEL_ACTION': onOdysWheelAction(state, action as any),
  // }
  // const fn = m[action.type]

  switch (action.type) {
    case 'ODYS_RAISE_SHAPE_ACTION':
      return onOdysRaiseShape(state, action);
    case 'ODYS_ADD_SHAPE_ACTION':
      return onOdysAddShapeAction(state, action);
    case 'ODYS_DELETE_SHAPE_ACTION':
      return onOdysDeleteShapeAction(state, action);
    case 'ODYS_START_DRAG_ACTION':
      return onOdysStartDragAction(state, action);
    case 'ODYS_START_PAN_ACTION':
      return onOdysStartPanAction(state, action);
    case 'ODYS_START_RESIZE_SHAPE_ACTION':
      return onOdysStartResizeShapeAction(state, action);
    case 'ODYS_SELECT_ACTION':
      return onOdysSelectAction(state, action);
    case 'ODYS_START_NEW_RECT_BY_CLICK_ACTION':
      return onOdysStartNewRectByClickAction(state, action);
    case `ODYS_SELECTED_SHAPE_INPUT_CHANGE_ACTION`:
      return onOdysSelectedShapeInputChangeAction(state, action);
    case 'ODYS_END_NEW_RECT_BY_CLICK_ACTION':
      return onOdysEndNewRectByClickAction(state, action);
    case 'ODYS_DRAG_ACTION':
      return onOdysDragAction(state, action);
    case 'ODYS_END_DRAG_ACTION':
      return onOdysEndDragAction(state, action);
    case 'ODYS_PAN_ACTION':
      return onOdysPanAction(state, action);
    case 'ODYS_END_PAN_ACTION':
      return onOdysEndPanAction(state, action);
    case 'ODYS_RESIZE_SHAPE_ACTION':
      return onOdysResizeShapeAction(state, action);
    case 'ODYS_END_RESIZE_SHAPE_ACTION':
      return onOdysEndResizeShapeAction(state, action);
    case 'ODYS_WHEEL_ACTION':
      return onOdysWheelAction(state, action);
    default:
      throw new Error(`Unknown action ${action}`);
  }
}

function onOdysAddShapeAction(
  state: GlobalState,
  action: OdysAddShapeAction
): GlobalState {
  return {
    ...state,
    shapes: [...state.shapes, action.shape]
  };
}

function onOdysDeleteShapeAction(
  state: GlobalState,
  action: OdysDeleteShapeAction
): GlobalState {
  return {
    ...state,
    shapes: state.shapes.filter(s => s.id !== action.id)
  };
}

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

function onOdysStartPanAction(
  state: GlobalState,
  action: OdysStartPanAction
): GlobalState {
  return {
    ...state,
    pan: {
      clickX: action.clickX,
      clickY: action.clickY
    }
  };
}

function onOdysStartResizeShapeAction(
  state: GlobalState,
  action: OdysStartResizeShapeAction
): GlobalState {
  return {
    ...state,
    resizeShape: {
      id: action.id,
      anchor: action.anchor,
      originalX: action.originalX,
      originalY: action.originalY,
      clickX: 0,
      clickY: 0
    }
  };
}

function onOdysSelectAction(
  state: GlobalState,
  action: OdysSelectAction
): GlobalState {
  return {
    ...state,
    selectedId: action.id
  };
}

function onOdysStartNewRectByClickAction(
  state: GlobalState,
  action: OdysStartNewRectByClickAction
): GlobalState {
  return {
    ...state,
    selectedId: null,
    newRectByClick: {
      clickX: action.clickX,
      clickY: action.clickY
    }
  };
}

function onOdysSelectedShapeInputChangeAction(
  state: GlobalState,
  action: OdysSelectedShapeInputChangeAction
): GlobalState {
  const { id, text } = action;
  const { shapes } = state;
  const idx = shapes.findIndex(d => d.id === id);
  if (idx === -1) {
    throw new Error(`[edit] Cannot find ${id} in shapes context`);
  }
  const shape = {
    ...shapes[idx],
    text: text
  };

  return {
    ...state,
    shapes: [...shapes.slice(0, idx), ...shapes.slice(idx + 1), ...[shape]]
  };
}

function onOdysRaiseShape(
  state: GlobalState,
  action: OdysRaiseShapeAction
): GlobalState {
  const { id } = action;
  const { shapes } = state;
  const idx = shapes.findIndex(d => d.id === id);
  if (idx === -1) {
    throw new Error(`Cannot find ${id} in shapes context`);
  }

  const item = shapes[idx];
  return {
    ...state,
    shapes: [...shapes.slice(0, idx), ...shapes.slice(idx + 1), ...[item]]
  };
}

function onOdysEndNewRectByClickAction(
  state: GlobalState,
  action: OdysEndNewRectByClickAction
): GlobalState {
  const id = uid();
  const x = (action.clickX - state.svg.topLeftX) / state.svg.scale;
  const y = (action.clickY - state.svg.topLeftY) / state.svg.scale;

  return {
    ...state,
    drag: null,
    newRectByClick: null,
    pan: null,
    selectedId: id,
    shapes: [
      ...state.shapes,
      {
        type: 'rect',
        id: id,
        text: 'A',
        x: x - RECT_WIDTH / 2,
        y: y - RECT_HEIGHT / 2,
        translateX: 0,
        translateY: 0,
        width: RECT_WIDTH,
        height: RECT_HEIGHT,
        deltaWidth: 0,
        deltaHeight: 0
      } as RectProps
    ]
  };
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
      x: (shapes[idx].x as number) + shapes[idx].translateX,
      y: (shapes[idx].y as number) + shapes[idx].translateY,
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

function onOdysEndPanAction(
  state: GlobalState,
  action: OdysEndPanAction
): GlobalState {
  if (state.pan) {
    return {
      ...state,
      drag: null,
      newRectByClick: null,
      pan: null,
      svg: {
        ...state.svg,
        topLeftX: state.svg.topLeftX + state.svg.translateX,
        topLeftY: state.svg.topLeftY + state.svg.translateY,
        translateX: 0,
        translateY: 0
      }
    };
  }

  throw new Error(
    'Could not end pan action. Was it started with ODYS_START_PAN_ACTION?'
  );
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

function onOdysResizeShapeAction(
  state: GlobalState,
  action: OdysResizeShapeAction
): GlobalState {
  if (state.resizeShape) {
    const { id } = state.resizeShape;
    const { shapes } = state;
    const idx = shapes.findIndex(d => d.id === id);
    if (idx === -1) {
      throw new Error(`[resize] Cannot find ${id} in shapes`);
    }

    const shape = {
      ...shapes[idx],
      deltaWidth:
        (action.clickX - state.resizeShape.originalX) / state.svg.scale,
      deltaHeight:
        (action.clickY - state.resizeShape.originalY) / state.svg.scale
    };

    return {
      ...state,
      shapes: [...shapes.slice(0, idx), ...shapes.slice(idx + 1), ...[shape]]
    };
  }

  throw new Error(
    'Cannot ODYS_RESIZE_SHAPE_ACTION without `state.resizeShape` (did ODYS_START_RESIZE_SHAPE_ACTION fire first?)'
  );
}

function onOdysEndResizeShapeAction(
  state: GlobalState,
  action: OdysEndResizeShapeAction
): GlobalState {
  if (state.resizeShape) {
    const { shapes } = state;
    const { id } = state.resizeShape;
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
      resizeShape: null,
      shapes: [...shapes.slice(0, idx), ...shapes.slice(idx + 1), ...[shape]]
    };
  }

  throw new Error(
    'Could not end resize shape action. Was it started with ODYS_START_RESIZE_SHAPE_ACTION?'
  );
}

function onOdysPanAction(
  state: GlobalState,
  action: OdysPanAction
): GlobalState {
  if (state.pan) {
    return {
      ...state,
      svg: {
        ...state.svg,
        translateX: action.clickX - state.pan.clickX,
        translateY: action.clickY - state.pan.clickY
      }
    };
  }

  throw new Error(
    'Cannot ODYS_PAN_ACTION without `state.pan` (did ODYS_START_PAN_ACTION fire first?)'
  );
}

function onOdysWheelAction(
  state: GlobalState,
  action: OdysWheelAction
): GlobalState {
  // Unsure precisely what inverting does.
  // Attempts to change coordinate plane from client to svg?
  const invertX = (action.clickX - state.svg.topLeftX) / state.svg.scale;
  const invertY = (action.clickY - state.svg.topLeftY) / state.svg.scale;
  const k = Math.max(0, state.svg.scale * Math.pow(2, action.scaleFactor));

  return {
    ...state,
    svg: {
      ...state.svg,
      scale: k,
      topLeftX: action.clickX - invertX * k,
      topLeftY: action.clickY - invertY * k
    }
  };
}
