import React, { Dispatch } from 'react';
import Shape from './shapes/Shape';
import Node from './ulys/Node';
import Parser from './ulys/Parser';
import Scanner from './ulys/Scanner';
import Token from './ulys/Token';
import Environment from './ulys/Environment';
import Drawer from './ulys/interpreters/Drawer';
import { v4 } from 'uuid';
import { RectProps } from './shapes/Rect';

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
    case 'ODYS_ADD_SHAPE':
      return {
        ...state,
        shapes: [...state.shapes, action.shape]
      };
    case 'ODYS_UPDATE_CODE':
      const environment = new Environment();
      const { code } = action;

      // TODO(vivek): dont make new Scanner/Parser/Drawer each time.
      const scanner = new Scanner(code);
      const tokens: Token[] = scanner.scan();
      console.log(tokens);

      const parser = new Parser(environment, tokens);
      const nodes: Node[] = parser.parse();
      console.log(`nodes: `);
      console.log(nodes);

      console.log();
      console.log(`environment: `);
      console.log(environment);

      const drawer = new Drawer(environment);
      const newShapes: Shape[] = nodes.flatMap(n => drawer.draw(n));
      console.log(`shapes: `);
      console.log(newShapes);

      return {
        ...state,
        shapes: newShapes
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
      // click SVG -> new shape
      if (
        state.mouseDown &&
        state.mouseDown.clickX === action.clickX &&
        state.mouseDown.clickY === action.clickY
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
              x: x,
              y: y,
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
          dragId: null,
          mouseDown: null,
          shapes: [
            ...shapes.slice(0, idx),
            ...shapes.slice(idx + 1),
            ...[shape]
          ]
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
    case 'ODYS_MOUSE_MOVE':
      return onOdysMouseMove(state, action);
    case 'ODYS_WHEEL':
      return onOdysWheel(state, action);
    default:
      throw new Error(`Unknown action ${action}`);
  }
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
      translateX: action.clickX - state.mouseDown.clickX,
      translateY: action.clickY - state.mouseDown.clickY
    };

    return {
      ...state,
      shapes: [...shapes.slice(0, idx), ...shapes.slice(idx + 1), ...[shape]]
    };
  }

  // panning
  if (state.mouseDown) {
    console.log();
    return {
      ...state,
      svg: {
        ...state.svg,
        topLeftX: state.svg.topLeftX,
        topLeftY: state.svg.topLeftY,
        translateX: action.clickX - state.mouseDown.clickX,
        translateY: action.clickY - state.mouseDown.clickY
      }
    };
  }

  throw new Error('Unknown MouseMove state (not dragging or panning).');
}

function onOdysWheel(state: GlobalState, action: OdysWheelAction): GlobalState {
  return {
    ...state,
    svg: {
      ...state.svg,
      scale: Math.max(0, state.svg.scale * Math.pow(2, action.scaleFactor))
    }
  };
}
