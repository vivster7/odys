import { Drawing, DrawState } from 'modules/draw/draw.reducer';
import { instanceOfArrow } from 'modules/draw/arrow/arrow.reducer';

export function reorder(drawings: Drawing[], state: DrawState): void {
  drawings.forEach((d) => reorderOne(d, state));
}

function reorderOne(drawing: Drawing, state: DrawState): void {
  let order = state.drawOrder;
  // remove from `order` array if present
  const idx = order.findIndex((id) => id === drawing.id);
  if (idx !== -1) {
    order.splice(idx, 1);
  }

  if (drawing.isDeleted) {
    return;
    // 2020-05-16: I think arrows get marked as deleted before we call reorder.
    // So don't need to grab connection logic here.
    //
    // if (instanceOfShape(drawing)) {
    //   const connections = Object.values(state.arrows)
    //     .filter(
    //       (a) => a.toShapeId === drawing.id || a.fromShapeId === drawing.id
    //     )
    //     .map((a) => a.id);
    //   state.drawOrder = order.filter((drawId) => !connections.includes(drawId));
    // }
    // return;
  }

  if (instanceOfArrow(drawing)) {
    order.push(drawing.id);
    return;
  }

  // grouping rects must come first. they are ordered against each other by `x` position.
  if (drawing.type === 'grouping_rect') {
    let insertIdx = 0;
    for (let i = 0; i < order.length; i++) {
      const id = order[i];
      const s = state.shapes[id];
      if (s?.type === 'grouping_rect' && s?.x < drawing.x) continue;
      insertIdx = i;
      break;
    }
    order.splice(insertIdx, 0, drawing.id);
    return;
  }

  // by default, add to top
  order.push(drawing.id);
}
