import { DrawState, Drawing, getDrawings } from '../draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { OdysShape } from 'generated';
import { Draggable } from 'modules/draw/shape/mixins/drag/drag.reducer';
import { Resizable } from 'modules/draw/shape/mixins/resize/resize.reducer';
import { TextEditable } from 'modules/draw/mixins/editText/editText.reducer';
import { Selectable } from 'modules/draw/mixins/select/select.reducer';
import { Deleteable } from 'modules/draw/mixins/delete/delete.reducer';
import { Saveable } from '../mixins/save/save.reducer';
import odysClient from 'global/odysClient';
import { DEFAULT_ZOOM_LEVEL } from 'modules/canvas/zoom/zoom.reducer';
import { SHAPE_HEIGHT, SHAPE_WIDTH } from './type/BaseShape';
import uuid from 'uuid';

export type Shape = Rect | GroupingRect | Text;
interface Parentable {
  parentId: string;
}

type ShapeMixins = Draggable &
  Resizable &
  Selectable &
  TextEditable &
  Parentable &
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
  return getDrawings(state, ids).filter((d) => instanceOfShape(d)) as Shape[];
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

export const newShape = (boardId: string, shape: Partial<Shape>): Shape => {
  const defaults: Shape = {
    boardId: boardId,
    id: uuid.v4(),
    type: 'rect',
    text: 'text',
    x: 0,
    y: 0,
    width: SHAPE_WIDTH,
    height: SHAPE_HEIGHT,
    createdAtZoomLevel: DEFAULT_ZOOM_LEVEL,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
    translateX: 0,
    translateY: 0,
    deltaWidth: 0,
    deltaHeight: 0,
    isSavedInDB: true,
    parentId: '',
  };

  return Object.assign(defaults, shape);
};
