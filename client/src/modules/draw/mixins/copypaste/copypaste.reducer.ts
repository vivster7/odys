import {
  DrawReducer,
  getDrawing,
  getDrawings,
} from 'modules/draw/draw.reducer';
import { instanceOfShape } from 'modules/draw/shape/shape.reducer';

export interface CopyPasteState {
  // Ids of copied shapes.
  ids: string[];
}

export const copyFn: DrawReducer = (state, action) => {
  const allIds = [];
  if (state.select) {
    allIds.push(state.select.id);
  }

  if (state.multiSelect) {
    allIds.push(...Object.keys(state.multiSelect.selectedShapeIds));
  }

  const drawings = getDrawings(state, allIds);
  // can only copy shapes
  const shapes = drawings.filter((d) => instanceOfShape(d));
  state.copyPaste.ids = shapes.map((s) => s.id);

  // note: cannot undo ctrl+c
};
