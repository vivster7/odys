import { GlobalActionType, GlobalState } from '../globals';
import Shape from '../shapes/Shape';

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

export interface OdysSelectShapeAction extends GlobalActionType {
  type: 'ODYS_SELECT_SHAPE_ACTION';
  id: string;
}

export interface OdysSelectedShapeInputChangeAction extends GlobalActionType {
  type: 'ODYS_SELECTED_SHAPE_INPUT_CHANGE_ACTION';
  id: string;
  text: string;
}

const shapeReducerMap = {
  ODYS_RAISE_SHAPE_ACTION: onOdysRaiseShape,
  ODYS_ADD_SHAPE_ACTION: onOdysAddShapeAction,
  ODYS_DELETE_SHAPE_ACTION: onOdysDeleteShapeAction,
  ODYS_SELECT_SHAPE_ACTION: onOdysSelectShapeAction,
  ODYS_SELECTED_SHAPE_INPUT_CHANGE_ACTION: onOdysSelectedShapeInputChangeAction
};

export default shapeReducerMap;
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

function onOdysSelectShapeAction(
  state: GlobalState,
  action: OdysSelectShapeAction
): GlobalState {
  return {
    ...state,
    select: {
      id: action.id,
      isEditing: false
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
