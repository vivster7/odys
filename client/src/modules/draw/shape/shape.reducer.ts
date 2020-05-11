import { DrawReducer, reorder, DrawState } from '../draw.reducer';
import { PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import Shape from './Shape';
import { ArrowProps } from '../arrow/Arrow';
import { OdysShape } from 'generated';
import { ShapeApi } from 'generated/apis/ShapeApi';
import { RectProps } from './type/Rect';

export const addShapeFn: DrawReducer<Shape> = (state, action) => {
  state.shapes[action.payload.id] = action.payload as any;
  reorder(state.shapes, state.drawOrder, action.payload);
};

export const editShapeFn: DrawReducer<Shape> = (state, action) => {
  const { id } = action.payload;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }
  const shape = state.shapes[id];
  state.shapes[id] = {
    ...shape,
    ...action.payload,
  };
  reorder(state.shapes, state.drawOrder, action.payload);
};

export const syncShapeFn: DrawReducer<Shape> = (state, action) => {
  const { id } = action.payload;
  if (!state.shapes[id]) {
    return addShapeFn(state, {
      ...action,
      payload: { ...action.payload, isLastUpdatedBySync: true },
    });
  }
  return editShapeFn(state, {
    ...action,
    payload: { ...action.payload, isLastUpdatedBySync: true },
  });
};

export const raiseShapeFn: DrawReducer<string> = (state, action) => {
  const id = action.payload;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  reorder(state.shapes, state.drawOrder, state.shapes[id]);
};

export const deleteShapeFn: DrawReducer<string> = (state, action) => {
  const id = action.payload;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  delete state.shapes[id];
  state.drawOrder = state.drawOrder.filter((shapeId) => {
    if (shapeId === id) {
      return false;
    }

    const shape = state.shapes[shapeId];
    if (shape.type === 'arrow') {
      const arrow = shape as ArrowProps;
      if (arrow.fromId === id || arrow.toId === id) return false;
    }

    return true;
  });
};

export const getShapes = createAsyncThunk(
  'draw/getShapes',
  async (boardId: string, thunkAPI): Promise<OdysShape[]> => {
    const api = new ShapeApi();
    return api.shapeGet({ boardId: `eq.${boardId}` });
  }
);

export const getShapesFulfilled = (
  state: DrawState,
  action: PayloadAction<OdysShape[]>
) => {
  const shapes = action.payload;
  shapes.forEach((s) => {
    const shape: RectProps = {
      ...s,
      type: 'rect',
      createdAtZoomLevel: 5,
      isLastUpdatedBySync: false,
      translateX: 0,
      translateY: 0,
      deltaWidth: 0,
      deltaHeight: 0,
    };
    state.shapes[s.id] = shape;
    //TODO: order should be saved on server.
    reorder(state.shapes, state.drawOrder, shape);
  });
};
