import { reorder, DrawState } from '../draw.reducer';
import { PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { OdysShape } from 'generated';
import { ShapeApi } from 'generated/apis/ShapeApi';
import { Draggable } from 'modules/draw/shape/mixins/drag/drag.reducer';
import { Resizable } from 'modules/draw/shape/mixins/resize/resize.reducer';
import { TextEditable } from 'modules/draw/mixins/editText/editText.reducer';
import { Selectable } from 'modules/draw/mixins/select/select.reducer';
import { Syncable } from 'modules/draw/mixins/sync/sync';

export type Shape = Rect | GroupingRect | Text;
type ShapeMixins = Draggable & Resizable & Selectable & TextEditable & Syncable;
export interface Rect extends OdysShape, ShapeMixins {
  type: 'rect';
}
export interface GroupingRect extends OdysShape, ShapeMixins {
  type: 'grouping_rect';
}
export interface Text extends OdysShape, ShapeMixins {
  type: 'text';
}

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
    const type = s.type;
    if (type !== 'rect' && type !== 'grouping_rect' && type !== 'text') return;
    const shape: Shape = {
      ...s,
      type: type,
      isLastUpdatedBySync: false,
      translateX: 0,
      translateY: 0,
      deltaWidth: 0,
      deltaHeight: 0,
    };
    state.shapes[s.id] = shape;
    //TODO: order should be saved on server.
    reorder(shape, state);
  });
};
