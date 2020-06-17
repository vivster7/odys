import {
  DrawReducer,
  Drawing,
  DrawState,
  getDrawings,
} from '../../draw.reducer';
import Box, { isOverlapping, outline, isIntersectingPath } from 'math/box';
import { instanceOfShape, Shape } from 'modules/draw/shape/shape.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import Point from 'math/point';
import uuid from 'uuid';
import {
  endEditTextPending,
  startEditTextFn,
} from '../editText/editText.reducer';
import { computeCurve } from 'modules/draw/arrow/path';
import { Arrow } from 'modules/draw/arrow/arrow.reducer';

export interface MultiSelectState {
  // origin where selectionRect begins
  origin: Point | null;

  // resizeble rect used to multiselect
  selectionRect: Box | null;

  // drawings selected by the resizeable rect
  selectedIds: { [key: string]: boolean };

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
    selectedIds: {},
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

  const selectedShapes = Object.values(state.shapes)
    .filter((s) => !s.isDeleted)
    .filter((s) => isOverlapping(s, selectionRect))
    .map((s) => [s.id, true]);
  const selectedShapesIds = Object.fromEntries(selectedShapes);

  const selectedArrows = Object.values(state.arrows)
    .filter((a) => !a.isDeleted)
    .filter((a) => {
      const fromSelected = selectedShapesIds[a.fromShapeId];
      const toSelected = selectedShapesIds[a.toShapeId];
      if (fromSelected && toSelected) return true;
      return isIntersectingArrow(state, selectionRect, a);
    })
    .map((s) => [s.id, true]);
  const selectedArrowIds = Object.fromEntries(selectedArrows);

  state.multiSelect.selectedIds = Object.assign(
    {},
    selectedShapesIds,
    selectedArrowIds
  );
};

export const endDragSelectionFn: DrawReducer = (state, action) => {
  if (!state.multiSelect || !state.multiSelect.selectionRect)
    throw new Error(
      `draw/startDragSelection must be called before draw/endDragSelection`
    );

  state.multiSelect.selectionRect = null;
  const { selectedIds } = state.multiSelect;

  const drawings: Drawing[] = getDrawings(state, Object.keys(selectedIds));
  applySelect(state, drawings);
};

export const selectAllFn: DrawReducer = (state, action) => {
  const drawings: Drawing[] = Object.values({
    ...state.shapes,
    ...state.arrows,
  });
  applySelect(state, drawings);
};

export const applySelect = (state: DrawState, drawings: Drawing[]) => {
  // before beginning a new selection, complete any edits
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
    const drawing = drawings[0];
    state.select = { id: drawing.id };
    state.multiSelect = null;
    if (drawing.text === '' && instanceOfShape(drawing)) {
      startEditTextFn(state, {
        type: 'draw/startEditText',
        payload: drawing.id,
      });
    }
  } else {
    state.select = null;
    const shapes = drawings.filter((d) => instanceOfShape(d)) as Shape[];
    if (shapes.length === 0) {
      state.multiSelect = null;
    } else {
      state.multiSelect = {
        origin: null,
        selectionRect: null,
        selectedIds: Object.fromEntries(drawings.map((d) => [d.id, true])),
        outline: outline(...shapes),
      };
    }
  }
};

export const isSelected = (state: DrawState, ids: string[]) => {
  if (state.select) {
    return ids.includes(state.select?.id);
  }

  if (state.multiSelect) {
    return Object.keys(state.multiSelect.selectedIds).some((id) =>
      ids.includes(id)
    );
  }

  return false;
};

function getSelectedIdSet(state: DrawState): Set<string> {
  const ids: Set<string> = new Set(
    Object.keys(state.multiSelect?.selectedIds ?? {})
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

function isIntersectingArrow(
  state: DrawState,
  rect: Box,
  arrow: Arrow
): boolean {
  const fromShape = state.shapes[arrow.fromShapeId];
  const toShape = state.shapes[arrow.toShapeId];
  const { path } = computeCurve(arrow.id, fromShape, toShape, [], []);
  return isIntersectingPath(rect, path ?? '');
}
