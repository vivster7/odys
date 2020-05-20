import { DrawReducer, Drawing, DrawState } from '../../draw.reducer';
import Box, { isOverlapping, outline } from '../../../../math/box';
import { TimeTravelSafeAction } from 'modules/draw/timetravel/timeTravel';
import { instanceOfShape, Shape } from 'modules/draw/shape/shape.reducer';

export interface MultiDragState {
  startX: number;
  startY: number;
}

interface startDragSelection {
  x: number;
  y: number;
  canvasTopLeftX: number;
  canvasTopLeftY: number;
  canvasScale: number;
}

export const startDragSelectionFn: DrawReducer<startDragSelection> = (
  state,
  action
) => {
  const { x, y, canvasTopLeftX, canvasTopLeftY, canvasScale } = action.payload;
  state.multiSelect = {
    selectionRect: {
      x: (x - canvasTopLeftX) / canvasScale,
      y: (y - canvasTopLeftY) / canvasScale,
      width: 0,
      height: 0,
    },
    selectedShapeIds: {},
    outline: { x: 0, y: 0, width: 0, height: 0 },
  };
};

export interface MultiSelectState {
  selectionRect: Box | null;
  selectedShapeIds: { [key: string]: boolean };
  outline: Box;
}
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
  if (!state.multiSelect || !state.multiSelect.selectionRect)
    throw new Error(
      `draw/startDragSelection must be called before draw/resizeDragSelection`
    );

  const { selectionRect } = state.multiSelect;

  const {
    clickX,
    clickY,
    canvasTopLeftX,
    canvasTopLeftY,
    canvasScale,
  } = action.payload;
  const { x, y } = selectionRect;
  const deltaWidth = (clickX - canvasTopLeftX) / canvasScale - x;
  const deltaHeight = (clickY - canvasTopLeftY) / canvasScale - y;

  selectionRect.width = deltaWidth;
  selectionRect.height = deltaHeight;

  const selectedShapeIds = Object.values(state.shapes)
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

  const keys = Object.keys(selectedShapeIds);
  const shapes = Object.keys(selectedShapeIds).map((id) => state.shapes[id]);
  applySelect(state, shapes);
};

interface EndMultiDrag {
  translateX: number;
  translateY: number;
}
export const endMultiDragFn: DrawReducer<EndMultiDrag> = (state, action) => {
  state.multiDrag = null;
  if (!state.multiSelect) return;
  Object.keys(state.multiSelect.selectedShapeIds).forEach((id) => {
    const rect = state.shapes[id];
    rect.x += action.payload.translateX;
    rect.y += action.payload.translateY;
  });
  state.multiSelect.outline.x += action.payload.translateX;
  state.multiSelect.outline.y += action.payload.translateY;
};

export const applySelect = (state: DrawState, drawings: Drawing[]) => {
  const shapes = drawings.filter((d) => instanceOfShape(d)) as Shape[];
  if (drawings.length === 0) {
    state.select = null;
    state.multiSelect = null;
  } else if (drawings.length === 1) {
    state.select = { id: drawings[0].id };
    state.multiSelect = null;
  } else if (shapes.length === 1) {
    state.select = { id: shapes[0].id };
    state.multiSelect = null;
  } else {
    state.select = null;
    const shapes = drawings.filter((d) => instanceOfShape(d)) as Shape[];
    state.multiSelect = {
      selectionRect: null,
      selectedShapeIds: Object.fromEntries(shapes.map((s) => [s.id, true])),
      outline: outline(...shapes),
    };
  }
};

export const selectAllFn: DrawReducer = (state, action) => {
  const shapeIds = Object.keys(state.shapes);
  const shapes = Object.values(state.shapes);

  state.select = null;
  state.multiSelect = {
    selectionRect: null,
    selectedShapeIds: Object.fromEntries(shapeIds.map((id) => [id, true])),
    outline: outline(...shapes),
  };
};
