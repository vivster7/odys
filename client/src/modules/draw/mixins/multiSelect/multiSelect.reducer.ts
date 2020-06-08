import {
  DrawReducer,
  Drawing,
  DrawState,
  getDrawings,
} from '../../draw.reducer';
import Box, { isOverlapping, outline } from 'math/box';
import { instanceOfShape, Shape } from 'modules/draw/shape/shape.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import Point from 'math/point';
import uuid from 'uuid';
import {
  endEditTextPending,
  startEditTextFn,
} from '../editText/editText.reducer';

export interface MultiSelectState {
  // origin where selectionRect begins
  origin: Point | null;

  // resizeble rect used to multiselect
  selectionRect: Box | null;

  // shapes selected by the resizeable rect
  selectedShapeIds: { [key: string]: boolean };

  // outline around all selected shapes
  outline: Box;
}

interface StartDragSelection {
  x: number;
  y: number;
  canvasTopLeftX: number;
  canvasTopLeftY: number;
  canvasScale: number;
}

export const startDragSelectionFn: DrawReducer<StartDragSelection> = (
  state,
  action
) => {
  const { x, y, canvasTopLeftX, canvasTopLeftY, canvasScale } = action.payload;
  const scaledX = (x - canvasTopLeftX) / canvasScale;
  const scaledY = (y - canvasTopLeftY) / canvasScale;
  state.multiSelect = {
    origin: {
      x: scaledX,
      y: scaledY,
    },
    selectionRect: {
      x: scaledX,
      y: scaledY,
      width: 0,
      height: 0,
    },
    selectedShapeIds: {},
    outline: { x: 0, y: 0, width: 0, height: 0 },
  };
};

interface resizeDragSelection {
  clickX: number;
  clickY: number;
  canvasTopLeftX: number;
  canvasTopLeftY: number;
  canvasScale: number;
}

export const resizeDragSelectionFn: DrawReducer<resizeDragSelection> = (
  state,
  action
) => {
  if (!state.multiSelect) {
    throw new Error(
      `draw/startDragSelection must be called before draw/resizeDragSelection`
    );
  }
  const { origin, selectionRect } = state.multiSelect;
  if (!origin || !selectionRect) {
    throw new Error(
      'Missing `origin` or `selectionRect` on state.draw.mulitSelect'
    );
  }

  const {
    clickX,
    clickY,
    canvasTopLeftX,
    canvasTopLeftY,
    canvasScale,
  } = action.payload;

  const scaledClickX = (clickX - canvasTopLeftX) / canvasScale;
  const scaledClickY = (clickY - canvasTopLeftY) / canvasScale;

  let [newX, newWidth] = [0, 0];
  if (scaledClickX >= origin.x) {
    newX = origin.x;
    newWidth = scaledClickX - origin.x;
  } else {
    newX = scaledClickX;
    newWidth = origin.x - scaledClickX;
  }

  let [newY, newHeight] = [0, 0];
  if (scaledClickY >= origin.y) {
    newY = origin.y;
    newHeight = scaledClickY - origin.y;
  } else {
    newY = scaledClickY;
    newHeight = origin.y - scaledClickY;
  }

  selectionRect.x = newX;
  selectionRect.y = newY;
  selectionRect.width = newWidth;
  selectionRect.height = newHeight;

  const selectedShapeIds = Object.values(state.shapes)
    .filter((s) => !s.isDeleted)
    .filter((s) => isOverlapping(s, selectionRect))
    .map((s) => [s.id, true]);

  state.multiSelect.selectedShapeIds = Object.fromEntries(selectedShapeIds);
};

export const endDragSelectionFn: DrawReducer = (state, action) => {
  if (!state.multiSelect || !state.multiSelect.selectionRect)
    throw new Error(
      `draw/startDragSelection must be called before draw/endDragSelection`
    );

  state.multiSelect.selectionRect = null;
  const { selectedShapeIds } = state.multiSelect;

  const shapes = Object.keys(selectedShapeIds).map((id) => state.shapes[id]);
  applySelect(state, shapes);
};

export const selectAllFn: DrawReducer = (state, action) => {
  const shapes = Object.values(state.shapes).filter((s) => !s.isDeleted);
  applySelect(state, shapes);
};

export const applySelect = (state: DrawState, drawings: Drawing[]) => {
  if (state.editText !== null) {
    const endEditTextPendingAction = {
      type: 'draw/endEditTextPending',
      payload: undefined,
      meta: {
        arg: state.editText.id,
        requestId: uuid.v4(),
      },
    };
    endEditTextPending(state, endEditTextPendingAction);
  }

  if (drawings.length === 0) {
    state.select = null;
    state.multiSelect = null;
  } else if (drawings.length === 1) {
    state.select = { id: drawings[0].id };
    state.multiSelect = null;
    if (drawings[0].text === '') {
      startEditTextFn(state, {
        type: 'draw/startEditText',
        payload: drawings[0].id,
      });
    }
  } else {
    state.select = null;
    const shapes = drawings.filter((d) => instanceOfShape(d)) as Shape[];
    state.multiSelect = {
      origin: null,
      selectionRect: null,
      selectedShapeIds: Object.fromEntries(shapes.map((s) => [s.id, true])),
      outline: outline(...shapes),
    };
  }
};

export const isSelected = (state: DrawState, ids: string[]) => {
  if (state.select) {
    return ids.includes(state.select?.id);
  }

  if (state.multiSelect) {
    return Object.keys(state.multiSelect.selectedShapeIds).some((id) =>
      ids.includes(id)
    );
  }

  return false;
};

function getSelectedIdSet(state: DrawState): Set<string> {
  const ids: Set<string> = new Set(
    Object.keys(state.multiSelect?.selectedShapeIds ?? {})
  );
  if (state.select) {
    ids.add(state.select.id);
  }
  return ids;
}

export function applySelectOrDeselect(
  state: DrawState,
  id: string,
  shiftKey: boolean
) {
  let ids: Set<string> = new Set([id]);
  if (shiftKey) {
    ids = getSelectedIdSet(state);

    if (isSelected(state, [id])) {
      ids.delete(id);
    } else {
      ids.add(id);
    }
  }

  const drawings = getDrawings(state, Array.from(ids));
  applySelect(state, drawings);
  reorder(drawings, state);
}
