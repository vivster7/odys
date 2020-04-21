import React from 'react';
import { startDrag } from '../reducers/shapes/shape';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../App';
import Shape, { Selectable, Draggable, TextEditable } from './Shape';

export type TextProps = {
  type: 'text';
} & Shape &
  Selectable &
  Draggable &
  TextEditable;

const Text: React.FC<TextProps> = React.memo((props) => {
  const transform = `translate(${props.x}, ${props.y})`;
  const draggedId = useSelector(
    (state: RootState) => state.shapes.drag && state.shapes.drag.id
  );
  const dispatch = useDispatch();

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
        <tspan>{props.text}</tspan>
      </text>
    </g>
  );
});

export default Text;
