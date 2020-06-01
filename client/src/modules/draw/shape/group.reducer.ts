import { getDrawing, DrawActionPending } from '../draw.reducer';
import { reorder } from 'modules/draw/mixins/drawOrder/drawOrder';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { save } from '../mixins/save/save.reducer';
import { GroupingRect } from './shape.reducer';
import { DEFAULT_ZOOM_LEVEL } from 'modules/canvas/zoom/zoom.reducer';
import { TimeTravelSafeAction } from '../timetravel/timeTravel';

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
    inside: Object.keys(selectedShapeIds),
  };

  state.shapes[id] = group;
  reorder([group], state);

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
