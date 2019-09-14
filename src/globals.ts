import React, { Dispatch } from 'react';
import Shape from './shapes/Shape';

export interface GlobalState {
  shapes: Shape[];
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

export type GlobalAction = OdysRaiseShapeAction | OdysAddShapeAction;

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
    default:
      throw new Error(`Unknown action ${action}`);
  }
}
