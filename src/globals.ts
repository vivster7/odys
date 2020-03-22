import React, { Dispatch } from 'react';
import Shape from './shapes/Shape';
import { v4 } from 'uuid';
import { RectProps, RECT_HEIGHT, RECT_WIDTH } from './shapes/Rect';
import dragReducerMap, {
  OdysStartDragAction,
  OdysDragAction,
  OdysEndDragAction
} from './reducers/drag';
import panReducerMap, {
  OdysStartPanAction,
  OdysPanAction,
  OdysEndPanAction
} from './reducers/pan';
import resizeReducerMap, {
  OdysStartResizeAction,
  OdysResizeAction,
  OdysEndResizeAction
} from './reducers/resize';

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
  resize: ResizeState | null;
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

interface ResizeState {
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
  | OdysStartResizeAction
  | OdysResizeAction
  | OdysEndResizeAction
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

export function globalStateReducer(
  state: GlobalState,
  action: GlobalAction
): GlobalState {
  console.log(action.type);
  const m = {
    ODYS_RAISE_SHAPE_ACTION: onOdysRaiseShape,
    ODYS_ADD_SHAPE_ACTION: onOdysAddShapeAction,
    ODYS_DELETE_SHAPE_ACTION: onOdysDeleteShapeAction,
    ODYS_SELECT_ACTION: onOdysSelectAction,
    ODYS_START_NEW_RECT_BY_CLICK_ACTION: onOdysStartNewRectByClickAction,
    ODYS_SELECTED_SHAPE_INPUT_CHANGE_ACTION: onOdysSelectedShapeInputChangeAction,
    ODYS_END_NEW_RECT_BY_CLICK_ACTION: onOdysEndNewRectByClickAction,

    ODYS_WHEEL_ACTION: onOdysWheelAction,
    ...dragReducerMap,
    ...panReducerMap,
    ...resizeReducerMap
  };
  const fn = m[action.type];
  if (!fn) {
    throw new Error(`Unknown action ${action}`);
  }

  return fn(state, action as any);
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
