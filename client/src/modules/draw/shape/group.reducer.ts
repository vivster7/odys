import { getDrawing, DrawActionPending, DrawState } from '../draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { save } from '../mixins/save/save.reducer';
import { Shape, newShape } from './shape.reducer';
import { TimeTravelSafeAction } from '../timetravel/timeTravel';
import { deleteDrawings } from '../mixins/delete/delete.reducer';
import { RootState } from 'App';
import { applySelect } from '../mixins/multiSelect/multiSelect.reducer';

export const createGroup = createAsyncThunk(
  'draw/createGroup',
  async (id: string, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const shape = state.draw.shapes[id];
    const children = findDirectChildren(state.draw, [shape.id]);
    const ids = [id].concat(children.map((c) => c.id));

    thunkAPI.dispatch(save(ids));
  }
);

export const createGroupPending: DrawActionPending<string> = (
  state,
  action
) => {
  if (!state.multiSelect) {
    throw new Error('cannot create group with a selection');
  }

  const id = action.meta.arg;

  const { outline, selectedShapeIds } = state.multiSelect;
  const { x, y, width, height } = outline;

  const first = Object.keys(selectedShapeIds)[0];
  const drawing = getDrawing(state, first);

  const outlineMarginTop = 40;
  const outlineMargin = 20;
  const group: Shape = newShape(drawing.boardId, {
    id: id,
    type: 'grouping_rect',
    text: '',
    x: x - outlineMargin,
    y: y - outlineMarginTop,
    width: width + outlineMargin + outlineMargin,
    height: height + outlineMarginTop + outlineMargin,
  });

  state.shapes[id] = group;
  reorder([group], state);
  applySelect(state, [group]);

  Object.keys(selectedShapeIds).forEach((id) => {
    const shape = state.shapes[id];
    // cannot automatically reparent
    if (!shape.parentId) {
      shape.parentId = group.id;
    }
  });

  const undo: TimeTravelSafeAction = {
    actionCreatorName: 'safeDeleteDrawings',
    arg: [id],
  };
  const redo: TimeTravelSafeAction = {
    actionCreatorName: 'safeUpdateDrawings',
    arg: { drawings: [group] },
  };
  state.timetravel.undos.push({ undo, redo });
  state.timetravel.redos = [];
};

// This is module state to share information between the ungroup action
// and the pending/fulfilled/rejected reducers.
// It is key'd by requestId to be thread-safe.
const ungroupState: {
  [requestId: string]: string[];
} = {};

export const ungroup = createAsyncThunk(
  'draw/ungroup',
  async (id: string, thunkAPI) => {
    const requestId = thunkAPI.requestId;
    const childrenIds = ungroupState[requestId];
    thunkAPI.dispatch(save(childrenIds));
    thunkAPI.dispatch(deleteDrawings({ ids: [id] }));
  }
);

export const ungroupPending: DrawActionPending<string> = (state, action) => {
  const { requestId } = action.meta;
  const id = action.meta.arg;
  const shape = state.shapes[id];
  shape.isDeleted = true;

  const children = findDirectChildren(state, [shape.id]);
  children.forEach((c) => (c.parentId = ''));
  ungroupState[requestId] = children.map((c) => c.id);
};

export const ungroupRejected: DrawActionPending<string> = (state, action) => {
  const { requestId } = action.meta;
  delete ungroupState[requestId];
};

export const ungroupFulfilled: DrawActionPending<string> = (state, action) => {
  const { requestId } = action.meta;
  delete ungroupState[requestId];
};

export function findChildrenRecursively(
  state: DrawState,
  parents: Shape[]
): Shape[] {
  let queue = [...parents];
  let allChildren: Shape[] = [];
  while (queue.length !== 0) {
    const children = findDirectChildren(
      state,
      queue.map((s) => s.id)
    );
    allChildren = allChildren.concat(children);

    const next = children.filter((s) => s.type === 'grouping_rect');
    queue = next;
  }
  return allChildren;
}

function findDirectChildren(state: DrawState, parentIds: string[]): Shape[] {
  const set = new Set(parentIds);
  return Object.values(state.shapes).filter((s) => set.has(s.parentId));
}
