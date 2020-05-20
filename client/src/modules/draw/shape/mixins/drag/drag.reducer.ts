import {
  DrawReducer,
  DrawActionPending,
  DrawState,
} from '../../../draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { save } from 'modules/draw/mixins/save/save.reducer';
import { TimeTravelSafeAction } from 'modules/draw/timetravel/timeTravel';
import { Shape, getShape, getShapes } from '../../shape.reducer';

export interface DragState {
  id: string;
  encompassedIds: string[];
  clickX: number;
  clickY: number;
}

export interface Draggable {
  id: string;
  x: number;
  y: number;
  translateX: number;
  translateY: number;
}

interface Drag {
  clickX: number;
  clickY: number;
  scale: number;
}

export const startDragFn: DrawReducer<DragState> = (state, action) => {
  const id = action.payload.id;
  const shape = getShape(state, id);

  state.drag = {
    id: id,
    encompassedIds: findEncompassed(state, shape).map((s) => s.id),
    clickX: action.payload.clickX,
    clickY: action.payload.clickY,
  };

  state.shapes[id].isLastUpdatedBySync = false;
};

export const dragFn: DrawReducer<Drag> = (state, action) => {
  if (!state.drag) {
    throw new Error(
      'Cannot draw/drag without `state.drag` (did draw/startDrag fire first?)'
    );
  }

  const { id, encompassedIds } = state.drag;
  const startX = state.drag.clickX;
  const startY = state.drag.clickY;
  const shapes = getShapes(state, encompassedIds.concat([id]));

  const { clickX, clickY, scale } = action.payload;

  shapes.forEach((s) => {
    s.translateX = (clickX - startX) / scale;
    s.translateY = (clickY - startY) / scale;
    s.isLastUpdatedBySync = false;
  });
};

interface EndDrag {
  ids: string[];
  translateX: number;
  translateY: number;
}

// endDrag saves the optimistic update to the DB.
export const endDrag: any = createAsyncThunk(
  'draw/endDrag',
  async (endDrag: EndDrag, thunkAPI) => {
    const { ids, translateX, translateY } = endDrag;
    const hasMoved = translateX !== 0 || translateY !== 0;
    if (hasMoved) {
      thunkAPI.dispatch(save(ids));
    }
  }
);

// endDragPending optimistically updates the shape
export const endDragPending: DrawActionPending<EndDrag> = (state, action) => {
  state.drag = null;

  const { ids, translateX, translateY } = action.meta.arg;
  const hasMoved = translateX !== 0 || translateY !== 0;
  if (!hasMoved) {
    return;
  }

  const shapes = getShapes(state, ids);
  const shapeSnapshots = shapes.map((s) => {
    return {
      ...s,
      translateX: 0,
      translateY: 0,
      isLastUpdatedBySync: false,
      isSavedInDB: true,
    };
  });

  shapes.forEach((s) => {
    s.x += translateX;
    s.y += translateY;
    s.translateX = 0;
    s.translateY = 0;
    s.isLastUpdatedBySync = false;
    s.isSavedInDB = true;
  });
  reorder(shapes, state);

  if (state.multiSelect) {
    state.multiSelect.outline.x += translateX;
    state.multiSelect.outline.y += translateY;
  }

  const undo: TimeTravelSafeAction = {
    actionCreatorName: 'safeUpdateDrawings',
    arg: shapeSnapshots,
  };
  const redo: TimeTravelSafeAction = {
    actionCreatorName: 'safeUpdateDrawings',
    arg: shapes,
  };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};

function findEncompassed(state: DrawState, parent: Shape): Shape[] {
  if (parent.type !== 'grouping_rect') return [];

  const isEncompassedBy = (parent: Shape, s: Shape): boolean => {
    if (parent.id === s.id) return false;
    return (
      parent.x <= s.x &&
      parent.x + parent.width >= s.x + s.width &&
      parent.y <= s.y &&
      parent.y + parent.height >= s.y + s.height
    );
  };

  const shapes = Object.values(state.shapes);
  return shapes.filter((s) => isEncompassedBy(parent, s));
}
