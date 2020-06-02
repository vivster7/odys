import { getDrawing, DrawActionPending, DrawState } from '../draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { save } from '../mixins/save/save.reducer';
import { GroupingRect, Shape } from './shape.reducer';
import { DEFAULT_ZOOM_LEVEL } from 'modules/canvas/zoom/zoom.reducer';
import { TimeTravelSafeAction } from '../timetravel/timeTravel';
import { deleteDrawings } from '../mixins/delete/delete.reducer';
import { RootState } from 'App';

export const createGroup = createAsyncThunk(
  'draw/createGroup',
  async (id: string, thunkAPI) => {
    thunkAPI.dispatch(save([id]));
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
  const group: GroupingRect = {
    type: 'grouping_rect',
    id: id,
    text: '',
    x: x - outlineMargin,
    y: y - outlineMarginTop,
    translateX: 0,
    translateY: 0,
    width: width + outlineMargin + outlineMargin,
    height: height + outlineMarginTop + outlineMargin,
    deltaWidth: 0,
    deltaHeight: 0,
    createdAtZoomLevel: DEFAULT_ZOOM_LEVEL,
    isSavedInDB: false,
    boardId: drawing.boardId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDeleted: false,
    parentId: '',
  };

  state.shapes[id] = group;
  reorder([group], state);

  Object.keys(selectedShapeIds).forEach((id) => {
    const shape = state.shapes[id];
    // cannot automatically reparent
    if (!shape.parentId) {
      shape.parentId = group.id;
    }
  });

  state.select = { id };
  state.multiSelect = null;

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

export const ungroup = createAsyncThunk(
  'draw/ungroup',
  async (id: string, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const shape = state.draw.shapes[id];
    const children = findDirectChildren(state.draw, [shape]);

    thunkAPI.dispatch(save(children.map((c) => c.id)));
    thunkAPI.dispatch(deleteDrawings({ ids: [id] }));
  }
);

export const ungroupPending: DrawActionPending<string> = (state, action) => {
  const id = action.meta.arg;
  const shape = state.shapes[id];
  shape.isDeleted = true;

  const children = findDirectChildren(state, [shape]);
  children.forEach((c) => (c.parentId = ''));
};

export function findChildrenRecursively(
  state: DrawState,
  parents: Shape[]
): Shape[] {
  let queue = [...parents];
  let allChildren: Shape[] = [];
  while (queue.length !== 0) {
    const children = findDirectChildren(state, queue);
    allChildren = allChildren.concat(children);

    const next = children.filter((s) => s.type === 'grouping_rect');
    queue = next;
  }
  return allChildren;
}

function findDirectChildren(state: DrawState, parents: Shape[]): Shape[] {
  const parentIds = new Set(parents.map((p) => p.id));
  return Object.values(state.shapes).filter((s) => parentIds.has(s.parentId));
}
