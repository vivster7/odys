import React, { Dispatch } from 'react';
import Shape from './shapes/Shape';
import Node from './ulys/Node';
import Parser from './ulys/Parser';
import Scanner from './ulys/Scanner';
import Token from './ulys/Token';
import Environment from './ulys/Environment';
import Drawer from './ulys/interpreters/Drawer';

export interface GlobalState {
  shapes: Shape[];
  dragId: string | null;
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

export interface OdysMouseUp extends GlobalActionType {
  type: 'ODYS_MOUSE_UP';
}
export interface OdysMouseMove extends GlobalActionType {
  type: 'ODYS_MOUSE_MOVE';
  clickX: number;
  clickY: number;
}

export type GlobalAction =
  | OdysRaiseShapeAction
  | OdysAddShapeAction
  | OdysUpdateCode
  | OdysMouseUp
  | OdysMouseMove
  | OdysStartDragAction;

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
    case 'ODYS_MOUSE_UP':
      return {
        ...state,
        dragId: null
      };
    case 'ODYS_MOUSE_MOVE':
      return onOdysMouseMove(state, action);
    default:
      throw new Error(`Unknown action ${action}`);
  }
}

function onOdysMouseMove(
  state: GlobalState,
  action: OdysMouseMove
): GlobalState {
  if (state.dragId === null) {
    return state;
  }

  const id = state.dragId;
  const { shapes } = state;
  const idx = shapes.findIndex(d => d.id === id);
  if (idx === -1) {
    throw new Error(`Cannot find ${id} in shapes context`);
  }

  const shape = {
    ...shapes[idx],
    x: action.clickX,
    y: action.clickY,
    x1: action.clickX,
    y1: action.clickY
  };

  return {
    ...state,
    shapes: [...shapes.slice(0, idx), ...shapes.slice(idx + 1), ...[shape]]
  };
}
