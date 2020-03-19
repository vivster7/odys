import React, { Dispatch } from 'react';
import Shape from './shapes/Shape';
import { v4 } from 'uuid';
import { RectProps, RECT_HEIGHT, RECT_WIDTH } from './shapes/Rect';

const uid = () => `id-${v4()}`;
export interface GlobalState {
  shapes: Shape[];
  drag: DragState | null;
  pan: PanState | null;
  selectedId: string | null;
  mouseDown: MouseDownState | null;
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

interface MouseDownState {
  target: EventTarget;
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
  type: 'ODYS_RAISE_SHAPE';
  id: string;
}

export interface OdysAddShapeAction extends GlobalActionType {
  type: 'ODYS_ADD_SHAPE';
  shape: Shape;
}

export interface OdysUpdateCode extends GlobalActionType {
  type: 'ODYS_UPDATE_CODE';
  code: string;
}

export interface OdysStartDragAction extends GlobalActionType {
  type: 'ODYS_START_DRAG_ACTION';
  id: string;
  clickX: number;
  clickY: number;
}

export interface OdysStartPanAction extends GlobalActionType {
  type: 'ODYS_START_PAN_ACTION';
  clickX: number;
  clickY: number;
}

export interface OdysSelectAction extends GlobalActionType {
  type: 'ODYS_SELECT_ACTION';
  id: string;
}

export interface OdysMouseDownAction extends GlobalActionType {
  type: 'ODYS_MOUSE_DOWN';
  target: EventTarget;
  clickX: number;
  clickY: number;
}

export interface OdysMouseUpAction extends GlobalActionType {
  type: 'ODYS_MOUSE_UP';
  target: EventTarget;
  clickX: number;
  clickY: number;
}
export interface OdysDragAction extends GlobalActionType {
  type: 'ODYS_DRAG_ACTION';
  clickX: number;
  clickY: number;
}

export interface OdysPanAction extends GlobalActionType {
  type: 'ODYS_PAN_ACTION';
  clickX: number;
  clickY: number;
}

export interface OdysWheelAction extends GlobalActionType {
  type: 'ODYS_WHEEL';
  clickX: number;
  clickY: number;
  scaleFactor: number;
}

export type GlobalAction =
  | OdysRaiseShapeAction
  | OdysAddShapeAction
  | OdysUpdateCode
  | OdysMouseDownAction
  | OdysMouseUpAction
  | OdysDragAction
  | OdysPanAction
  | OdysStartDragAction
  | OdysStartPanAction
  | OdysSelectAction
  | OdysWheelAction;

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
  switch (action.type) {
    case 'ODYS_RAISE_SHAPE':
      return onOdysRaiseShape(state, action);
    case 'ODYS_ADD_SHAPE':
      return {
        ...state,
        shapes: [...state.shapes, action.shape]
      };
    case 'ODYS_START_DRAG_ACTION':
      return {
        ...state,
        drag: {
          id: action.id,
          clickX: action.clickX,
          clickY: action.clickY
        }
      };
    case 'ODYS_START_PAN_ACTION':
      return {
        ...state,
        pan: {
          clickX: action.clickX,
          clickY: action.clickY
        }
      };
    case 'ODYS_SELECT_ACTION':
      return {
        ...state,
        selectedId: action.id
      };
    case 'ODYS_MOUSE_DOWN':
      return {
        ...state,
        selectedId: null,
        mouseDown: {
          target: action.target,
          clickX: action.clickX,
          clickY: action.clickY
        }
      };
    case 'ODYS_MOUSE_UP':
      return onOdysMouseUp(state, action);
    case 'ODYS_DRAG_ACTION':
      return onOdysDragAction(state, action);
    case 'ODYS_PAN_ACTION':
      return onOdysPanAction(state, action);
    case 'ODYS_WHEEL':
      return onOdysWheel(state, action);
    default:
      throw new Error(`Unknown action ${action}`);
  }
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

function onOdysMouseUp(
  state: GlobalState,
  action: OdysMouseUpAction
): GlobalState {
  // click SVG -> new shape
  if (
    state.mouseDown &&
    state.mouseDown.clickX === action.clickX &&
    state.mouseDown.clickY === action.clickY &&
    state.drag === null
  ) {
    const x = (action.clickX - state.svg.topLeftX) / state.svg.scale;
    const y = (action.clickY - state.svg.topLeftY) / state.svg.scale;
    return {
      ...state,
      drag: null,
      mouseDown: null,
      pan: null,
      shapes: [
        ...state.shapes,
        {
          type: 'rect',
          id: uid(),
          text: 'A',
          x: x - RECT_WIDTH / 2,
          y: y - RECT_HEIGHT / 2,
          translateX: 0,
          translateY: 0
        } as RectProps
      ]
    };
  }

  // finish dragging
  if (state.drag !== null) {
    const { shapes } = state;
    const { id } = state.drag;
    const idx = shapes.findIndex(s => s.id === id);
    if (idx === -1) {
      throw new Error(`Cannot find ${id} in shapes context`);
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
      mouseDown: null,
      pan: null,
      shapes: [...shapes.slice(0, idx), ...shapes.slice(idx + 1), ...[shape]]
    };
  }

  // finish panning
  if (state.pan !== null) {
    return {
      ...state,
      drag: null,
      mouseDown: null,
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
    'Unknown MouseUp state (not dragging or panning or new rect).'
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
      throw new Error(`Cannot find ${id} in shapes context`);
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

function onOdysWheel(state: GlobalState, action: OdysWheelAction): GlobalState {
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
