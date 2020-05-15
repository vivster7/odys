import { DrawReducer } from '../../draw.reducer';
import Box, { isOverlapping, outline } from '../../../../math/box';

export interface GroupDragState {
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
  state.groupSelect = {
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

export interface GroupSelectState {
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
  if (!state.groupSelect || !state.groupSelect.selectionRect)
    throw new Error(
      `draw/startDragSelection must be called before draw/resizeDragSelection`
    );

  const { selectionRect } = state.groupSelect;

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
    .filter((s) => s.type === 'rect')
    .filter((s) => isOverlapping(s, selectionRect))
    .map((s) => [s.id, true]);

  state.groupSelect.selectedShapeIds = Object.fromEntries(selectedShapeIds);
};

export const endDragSelectionFn: DrawReducer = (state, action) => {
  if (!state.groupSelect || !state.groupSelect.selectionRect)
    throw new Error(
      `draw/startDragSelection must be called before draw/endDragSelection`
    );

  state.groupSelect.selectionRect = null;
  const { selectedShapeIds } = state.groupSelect;

  const keys = Object.keys(selectedShapeIds);
  if (keys.length === 0) {
    return;
  } else if (keys.length === 1) {
    state.select = {
      id: keys[0],
      isEditing: false,
    };
    state.groupSelect.selectedShapeIds = {};
  } else {
    const rects = Object.keys(selectedShapeIds).map((id) => state.shapes[id]);
    state.groupSelect.outline = outline(...rects);
  }
};

interface EndGroupDrag {
  translateX: number;
  translateY: number;
}
export const endGroupDragFn: DrawReducer<EndGroupDrag> = (state, action) => {
  state.groupDrag = null;
  if (!state.groupSelect) return;
  Object.keys(state.groupSelect.selectedShapeIds).forEach((id) => {
    const rect = state.shapes[id];
    rect.x += action.payload.translateX;
    rect.y += action.payload.translateY;
  });
  state.groupSelect.outline.x += action.payload.translateX;
  state.groupSelect.outline.y += action.payload.translateY;
};

export const selectAllFn: DrawReducer = (state, action) => {
  const shapeIds = Object.keys(state.shapes);
  const shapes = Object.values(state.shapes);

  state.select = null;
  state.groupSelect = {
    selectionRect: null,
    selectedShapeIds: Object.fromEntries(shapeIds.map((id) => [id, true])),
    outline: outline(...shapes),
  };
};
