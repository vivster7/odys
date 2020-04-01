import React, { Dispatch } from 'react';
import Shape from './shapes/Shape';
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
import wheelReducerMap, { OdysWheelAction } from './reducers/wheel';
import newRectByClickReducerMap, {
  OdysStartNewRectByClickAction,
  OdysEndNewRectByClickAction,
  OdysStartNewRectByDragAction,
  OdysNewRectByDragAction,
  OdysEndNewRectByDragAction
} from './reducers/newRectByClick';
import shapeReducerMap, {
  OdysRaiseShapeAction,
  OdysAddShapeAction,
  OdysDeleteShapeAction,
  OdysSelectShapeAction,
  OdysSelectedShapeEditTextAction,
  OdysDrawArrowAction,
  OdysCancelSelectAction
} from './reducers/shape';

export type NEAnchor = 'NEAnchor';
export type NWAnchor = 'NWAnchor';
export type SEAnchor = 'SEAnchor';
export type SWAnchor = 'SWAnchor';
export type Anchor = NEAnchor | NWAnchor | SEAnchor | SWAnchor;

export interface GlobalState {
  shapes: Shape[];
  drag: DragState | null;
  pan: PanState | null;
  resize: ResizeState | null;
  select: SelectState | null;
  newRectByClick: NewRectByClickState | null;
  newRectByDrag: NewRectByDragState | null;
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

interface SelectState {
  id: string;
  isEditing: boolean;
}

interface NewRectByClickState {
  clickX: number;
  clickY: number;
}

interface NewRectByDragState {
  clickX: number;
  clickY: number;
  shape: Shape | null;
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

export type GlobalAction =
  | OdysRaiseShapeAction
  | OdysAddShapeAction
  | OdysDeleteShapeAction
  | OdysDrawArrowAction
  | OdysSelectShapeAction
  | OdysCancelSelectAction
  | OdysSelectedShapeEditTextAction
  | OdysStartNewRectByClickAction
  | OdysEndNewRectByClickAction
  | OdysStartNewRectByDragAction
  | OdysNewRectByDragAction
  | OdysEndNewRectByDragAction
  | OdysStartDragAction
  | OdysDragAction
  | OdysEndDragAction
  | OdysStartPanAction
  | OdysPanAction
  | OdysEndPanAction
  | OdysStartResizeAction
  | OdysResizeAction
  | OdysEndResizeAction
  | OdysWheelAction;

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
    ...shapeReducerMap,
    ...newRectByClickReducerMap,
    ...dragReducerMap,
    ...panReducerMap,
    ...resizeReducerMap,
    ...wheelReducerMap
  };
  const fn = m[action.type];
  if (!fn) {
    throw new Error(`Unknown action ${action}`);
  }

  return fn(state, action as any);
}
