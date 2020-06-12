import { DrawReducer, DrawActionPending } from '../../../draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { save } from 'modules/draw/mixins/save/save.reducer';
import { TimeTravelSafeAction } from 'modules/draw/timetravel/timeTravel';
import { getShape, getShapes } from '../../shape.reducer';
import { findChildrenRecursively } from '../../group.reducer';
import { positionArrowsFn } from 'modules/draw/arrowposition/arrowPosition.reducer';
import { getConnectedArrows } from 'modules/draw/arrow/arrow.reducer';

export interface DragState {
  id: string;
  encompassedIds: string[];
  clickX: number;
  clickY: number;
  startX: number;
  startY: number;
}

export interface Draggable {
  id: string;
  x: number;
  y: number;
}

interface StartDrag {
  id: string;
  clickX: number;
  clickY: number;
}

export const startDragFn: DrawReducer<StartDrag> = (state, action) => {
  const { id, clickX, clickY } = action.payload;
  const shape = getShape(state, id);
  const children = findChildrenRecursively(state, [shape]);

  state.drag = {
    id: id,
    encompassedIds: children.map((c) => c.id),
    clickX: clickX,
    clickY: clickY,
    startX: clickX,
    startY: clickY,
  };
};

interface Drag {
  clickX: number;
  clickY: number;
  scale: number;
}

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
  const deltaX = (clickX - startX) / scale;
  const deltaY = (clickY - startY) / scale;

  shapes.forEach((s) => {
    s.x += deltaX;
    s.y += deltaY;
  });

  state.drag.clickX = clickX;
  state.drag.clickY = clickY;

  const ids = shapes.map((s) => s.id);
  const connectedArrows = getConnectedArrows(state, ids);
  positionArrowsFn(state, {
    type: 'draw/positionArrows',
    payload: connectedArrows,
  });
};

interface EndDrag {
  ids: string[];
  translateX: number;
  translateY: number;
}

// endDrag saves the optimistic update to the DB.
export const endDrag = createAsyncThunk(
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
  if (state.multiSelect) {
    shapes.forEach((s) => {
      s.x += translateX;
      s.y += translateY;
    });
    state.multiSelect.outline.x += translateX;
    state.multiSelect.outline.y += translateY;
  }
  reorder(shapes, state);

  const connectedArrows = getConnectedArrows(state, ids);
  positionArrowsFn(state, {
    type: 'draw/positionArrows',
    payload: connectedArrows,
  });

  const shapeSnapshots = shapes.map((s) => {
    return {
      ...s,
      x: s.x - translateX,
      y: s.y - translateY,
      isSavedInDB: true,
    };
  });

  const undo: TimeTravelSafeAction = {
    actionCreatorName: 'safeUpdateDrawings',
    arg: { drawings: shapeSnapshots },
  };
  const redo: TimeTravelSafeAction = {
    actionCreatorName: 'safeUpdateDrawings',
    arg: {
      drawings: shapes.map((s) => Object.assign({}, s)),
    },
  };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};
