import { DrawActionPending, DrawState, getDrawings } from '../draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { save } from '../mixins/save/save.reducer';
import { Shape, newShape, getShapes } from './shape.reducer';
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

  const { outline, selectedIds } = state.multiSelect;
  const { x, y, width, height } = outline;

  const drawings = getDrawings(state, Object.keys(selectedIds));
  if (drawings.length === 0) return;
  const { boardId } = drawings[0];

  const outlineMarginTop = 40;
  const outlineMargin = 20;
  const group: Shape = newShape(boardId, {
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

  const shapes = getShapes(state, Object.keys(selectedIds));
  shapes.forEach((shape) => {
    shape.parentId = group.id;
  });

  // TODO: bug -- need to remove/add parentId in undo/redo
  // consider a composite time travel safe action?
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
    thunkAPI.dispatch(deleteDrawings({ ids: [id] }));
  }
);

export const ungroupPending: DrawActionPending<string> = (state, action) => {
  // TODO: bug -- need to add/remove parents
  // currently dont worry about reparenting,
  // so undo-ing the ungroup (really a delete)
  // will keep the parent/child association alive
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
