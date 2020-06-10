import { DrawState, DrawReducer } from '../draw.reducer';
import {
  Orientation,
  horizontalOrientation,
  computeOrientation,
  getShapeValues,
} from '../arrow/path';
import { Arrow } from '../arrow/arrow.reducer';

export interface ArrowPositionState {
  [shapeId: string]: {
    [o in Orientation]: string[];
  };
}

export const positionArrowsFn: DrawReducer<Arrow[]> = (state, action) => {
  const arrows = action.payload;
  arrows.forEach((a) => positionArrow(state, a));
};

function positionArrow(state: DrawState, arrow: Arrow) {
  const fromShape = state.shapes[arrow.fromShapeId];
  const toShape = state.shapes[arrow.toShapeId];

  const { from, to } = computeOrientation(
    getShapeValues(fromShape),
    getShapeValues(toShape)
  );

  const orientationArrows = (direction: 'from' | 'to') => {
    const shape = direction === 'from' ? fromShape : toShape;
    const orientation = direction === 'from' ? from : to;

    const orientations = state.arrowPositions[shape.id] ?? {};

    // remove existing arrow from orientations
    Object.values(orientations).forEach((o) => {
      const idx = o.findIndex((id) => id === arrow.id);
      if (idx !== -1) o.splice(idx, 1);
    });

    // add back in correct orientation
    const arrowDatas = orientations[orientation] ?? [];
    if (!arrow.isDeleted) {
      arrowDatas.push(arrow.id);
    }

    // sort by ordering 'otherShape'
    const positionField = horizontalOrientation(orientation) ? 'yMid' : 'xMid';
    const sorted = arrowDatas.sort((id1, id2) => {
      const a1 = state.arrows[id1];
      const a2 = state.arrows[id2];

      const otherShapeId1 =
        a1.fromShapeId === shape.id ? a1.toShapeId : a1.fromShapeId;
      const otherShapeId2 =
        a2.fromShapeId === shape.id ? a2.toShapeId : a2.fromShapeId;

      const _aa = getShapeValues(state.shapes[otherShapeId1])[positionField];
      const _bb = getShapeValues(state.shapes[otherShapeId2])[positionField];

      if (_aa < _bb) return -1;
      if (_aa > _bb) return 1;
      return 1;
    });

    orientations[orientation] = sorted;
    return orientations;
  };
  state.arrowPositions[fromShape.id] = orientationArrows('from');
  state.arrowPositions[toShape.id] = orientationArrows('to');
}
