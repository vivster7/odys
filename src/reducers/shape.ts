import Shape from '../shapes/Shape';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ShapeID = string;

interface SelectedShape {
  id: string;
  isEditing: boolean;
}

interface DragState {
  id: string;
  clickX: number;
  clickY: number;
}

interface ShapeState {
  data: Shape[];
  select: SelectedShape | null;
  drag: DragState | null;
}

interface StartDrag {
  id: string;
  clickX: number;
  clickY: number;
}

interface Drag {
  clickX: number;
  clickY: number;
  scale: number;
}

const initialState: ShapeState = {
  data: [],
  select: null,
  drag: null,
};

const shapesSlice = createSlice({
  name: 'shapes',
  initialState: initialState,
  reducers: {
    addShape(state, action: PayloadAction<Shape>) {
      state.data = [...state.data, action.payload as any];
    },
    raiseShape(state, action: PayloadAction<ShapeID>) {
      const id = action.payload;
      const shape = state.data.find((s) => s.id === id);
      if (!shape) {
        throw new Error(`Cannot find ${id} in shapes context`);
      }

      state.data = [...state.data.filter((s) => s.id !== id), shape as any];
    },
    deleteShape(state, action: PayloadAction<ShapeID>) {
      const id = action.payload;
      state.data = state.data.filter((s) => s.id !== id);
    },
    drawArrow(state, action: PayloadAction<ShapeID>) {},
    selectShape(state, action: PayloadAction<ShapeID>) {
      const id = action.payload;
      state.select = {
        id,
        isEditing: false,
      };
    },
    cancelSelect(state, action: PayloadAction) {
      state.select = null;
    },
    selectedShapeEditText(state, action: PayloadAction<string>) {
      const { select } = state;
      if (!select) {
        throw new Error(
          `[shapes/editText] Cannot edit text if a shape is not selected. ODYS_SELECT_SHAPE_ACTION should have fired first.`
        );
      }

      const shape = state.data.find((d) => d.id === select.id);
      if (!shape) {
        throw new Error(
          `[shapes/editText] Cannot find selected shape (${select.id})`
        );
      }
      if (shape.type !== 'rect') {
        throw new Error(
          `[shapes/editText] Cannot only edit rects. Selected shape is not a rect (${select.id})`
        );
      }

      shape.text = action.payload;
      select.isEditing = true;
    },
    startDrag(state, action: PayloadAction<StartDrag>) {
      state.drag = {
        id: action.payload.id,
        clickX: action.payload.clickX,
        clickY: action.payload.clickY,
      };
    },
    drag(state, action: PayloadAction<Drag>) {
      if (!state.drag) {
        throw new Error(
          'Cannot shapes/draag without `state.drag` (did shapes/startDrag fire first?)'
        );
      }

      const { id } = state.drag;
      const shapes = state.data;
      const idx = shapes.findIndex((d) => d.id === id);
      if (idx === -1) {
        throw new Error(`[drag] Cannot find ${id} in shapes context`);
      }

      const shape = {
        ...shapes[idx],
        translateX:
          (action.payload.clickX - state.drag.clickX) / action.payload.scale,
        translateY:
          (action.payload.clickY - state.drag.clickY) / action.payload.scale,
      };

      state.data = [...state.data.filter((s) => s.id !== id), shape as any];
    },
    endDrag(state, action: PayloadAction) {
      if (!state.drag) {
        throw new Error(
          'Could not end drag action. Was it started with ODYS_START_DRAG_ACTION?'
        );
      }

      const shapes = state.data;
      const { id } = state.drag;
      const idx = shapes.findIndex((s) => s.id === id);
      if (idx === -1) {
        throw new Error(`[drag] Cannot find ${id} in shapes`);
      }

      const shape = {
        ...shapes[idx],
        x: (shapes[idx].x as number) + (shapes[idx].translateX as number),
        y: (shapes[idx].y as number) + (shapes[idx].translateY as number),
        translateX: 0,
        translateY: 0,
      };

      state.data = [...state.data.filter((s) => s.id !== id), shape as any];
      state.drag = null;
    },
  },
});

export const {
  addShape,
  selectedShapeEditText,
  cancelSelect,
  selectShape,
  drawArrow,
  startDrag,
  drag,
  endDrag,
} = shapesSlice.actions;
const shapesReducer = shapesSlice.reducer;
export default shapesReducer;
