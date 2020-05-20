import { DrawState, Drawing } from '../draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { OdysShape } from 'generated';
import { Draggable } from 'modules/draw/shape/mixins/drag/drag.reducer';
import { Resizable } from 'modules/draw/shape/mixins/resize/resize.reducer';
import { TextEditable } from 'modules/draw/mixins/editText/editText.reducer';
import { Selectable } from 'modules/draw/mixins/select/select.reducer';
import { Syncable } from 'modules/draw/mixins/sync/sync';
import { Deleteable } from 'modules/draw/mixins/delete/delete.reducer';
import { Saveable } from '../mixins/save/save.reducer';
import odysClient from 'global/odysClient';

export type Shape = Rect | GroupingRect | Text;
type ShapeMixins = Draggable &
  Resizable &
  Selectable &
  TextEditable &
  Syncable &
  Saveable &
  Deleteable;
export interface Rect extends OdysShape, ShapeMixins {
  type: 'rect';
}
export interface GroupingRect extends OdysShape, ShapeMixins {
  type: 'grouping_rect';
}
export interface Text extends OdysShape, ShapeMixins {
  type: 'text';
}

export function instanceOfShape(drawing: Drawing): drawing is Shape {
  return 'type' in drawing;
}

export function getShape(state: DrawState, id: string): Shape {
  const shape = state.shapes[id];
  if (!shape) {
    throw new Error(`Cannot find shape with ${id}`);
  }
  return shape;
}

export function getShapes(state: DrawState, ids: string[]): Shape[] {
  return ids.map((id) => getShape(state, id));
}

export const fetchShapes = createAsyncThunk(
  'draw/fetchShapes',
  async (boardId: string, thunkAPI): Promise<OdysShape[]> => {
    return odysClient.request('GET', 'OdysShape', {
      query: `board_id=eq.${boardId}&is_deleted=is.false`,
    });
  }
);

export const fetchShapesFulfilled = (
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
      isLastUpdatedBySync: true,
      isSavedInDB: true,
      isDeleted: false,
      translateX: 0,
      translateY: 0,
      deltaWidth: 0,
      deltaHeight: 0,
    };
    state.shapes[s.id] = shape;
    //TODO: order should be saved on server.
    reorder([shape], state);
  });
};
