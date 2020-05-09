import React from 'react';
import { startDrag } from '../draw.reducer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../App';
import Shape, { ShapeId, Selectable, Draggable, TextEditable } from './Shape';

export type TextProps = {
  type: 'text';
} & Shape &
  Selectable &
  Draggable &
  TextEditable;

const Text: React.FC<ShapeId> = React.memo((props) => {
  const { id } = props;
  const dispatch = useDispatch();

  const text = useSelector(
    (state: RootState) => state.shapes.data[id]
  ) as TextProps;
  const transform = `translate(${text.x}, ${text.y})`;
  const draggedId = useSelector(
    (state: RootState) => state.shapes.drag && state.shapes.drag.id
  );

  const cursor = draggedId === props.id ? 'grabbing' : 'grab';

  return (
    <g
      id={props.id}
      transform={transform}
      cursor={cursor}
      onMouseDown={(e) =>
        dispatch(
          startDrag({ id: props.id, clickX: e.clientX, clickY: e.clientY })
        )
      }
    >
      <text style={{ textAnchor: 'middle' }}>
        <tspan>{text.text}</tspan>
      </text>
    </g>
  );
});

export default Text;
