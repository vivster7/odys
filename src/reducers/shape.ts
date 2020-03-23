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

export interface OdysSelectedShapeEditTextAction extends GlobalActionType {
  type: 'ODYS_SELECTED_SHAPE_EDIT_TEXT_ACTION';
  text: string;
}

const shapeReducerMap = {
  ODYS_RAISE_SHAPE_ACTION: onOdysRaiseShape,
  ODYS_ADD_SHAPE_ACTION: onOdysAddShapeAction,
  ODYS_DELETE_SHAPE_ACTION: onOdysDeleteShapeAction,
  ODYS_SELECT_SHAPE_ACTION: onOdysSelectShapeAction,
  ODYS_SELECTED_SHAPE_EDIT_TEXT_ACTION: onOdysSelectedShapeEditTextAction
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

function onOdysSelectedShapeEditTextAction(
  state: GlobalState,
  action: OdysSelectedShapeEditTextAction
): GlobalState {
  if (!state.select) {
    throw new Error(
      `[select/edit] Cannot edit text if a shape is not selected. ODYS_SELECT_SHAPE_ACTION should have fired first.`
    );
  }

  const { shapes, select } = state;
  const idx = shapes.findIndex(d => d.id === select.id);
  if (idx === -1) {
    throw new Error(`[edit] Cannot find ${select.id} in shapes context`);
  }
  const shape = {
    ...shapes[idx],
    text: action.text
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
