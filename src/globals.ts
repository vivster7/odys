import React, { Dispatch } from 'react';
import Shape from './shapes/Shape';
import { v4 } from 'uuid';
import { RectProps, RECT_HEIGHT, RECT_WIDTH } from './shapes/Rect';

const uid = () => `id-${v4()}`;
export interface GlobalState {
  shapes: Shape[];
  dragId: string | null;
  mouseDown: MouseDownState | null;
  svg: SVGState;
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
export interface OdysMouseMoveAction extends GlobalActionType {
  type: 'ODYS_MOUSE_MOVE';
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
  | OdysMouseMoveAction
  | OdysStartDragAction
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
        dragId: action.id
      };
    case 'ODYS_MOUSE_DOWN':
      return {
        ...state,
        mouseDown: {
          target: action.target,
          clickX: action.clickX,
          clickY: action.clickY
        }
      };
    case 'ODYS_MOUSE_UP':
      return onOdysMouseUp(state, action);
    case 'ODYS_MOUSE_MOVE':
      return onOdysMouseMove(state, action);
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
    state.dragId === null
  ) {
    const x = (action.clickX - state.svg.topLeftX) / state.svg.scale;
    const y = (action.clickY - state.svg.topLeftY) / state.svg.scale;
    return {
      ...state,
      dragId: null,
      mouseDown: null,
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
  if (state.mouseDown && state.dragId !== null) {
    const { shapes } = state;
    const idx = shapes.findIndex(s => s.id === state.dragId);
    if (idx === -1) {
      throw new Error(`Cannot find ${state.dragId} in shapes context`);
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
      dragId: null,
      mouseDown: null,
      shapes: [...shapes.slice(0, idx), ...shapes.slice(idx + 1), ...[shape]]
    };
  }

  //panning
  return {
    ...state,
    dragId: null,
    mouseDown: null,
    svg: {
      ...state.svg,
      topLeftX: state.svg.topLeftX + state.svg.translateX,
      topLeftY: state.svg.topLeftY + state.svg.translateY,
      translateX: 0,
      translateY: 0
    }
  };
}

function onOdysMouseMove(
  state: GlobalState,
  action: OdysMouseMoveAction
): GlobalState {
  if (state.dragId === null && state.mouseDown === null) {
    return state;
  }

  // dragging
  if (state.mouseDown && state.dragId) {
    const id = state.dragId;
    const { shapes } = state;
    const idx = shapes.findIndex(d => d.id === id);
    if (idx === -1) {
      throw new Error(`Cannot find ${id} in shapes context`);
    }

    const shape = {
      ...shapes[idx],
      translateX: (action.clickX - state.mouseDown.clickX) / state.svg.scale,
      translateY: (action.clickY - state.mouseDown.clickY) / state.svg.scale
    };

    return {
      ...state,
      shapes: [...shapes.slice(0, idx), ...shapes.slice(idx + 1), ...[shape]]
    };
  }

  // panning
  if (state.mouseDown) {
    return {
      ...state,
      svg: {
        ...state.svg,
        translateX: action.clickX - state.mouseDown.clickX,
        translateY: action.clickY - state.mouseDown.clickY
      }
    };
  }

  throw new Error('Unknown MouseMove state (not dragging or panning).');
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
