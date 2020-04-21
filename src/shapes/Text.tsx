import React from 'react';
import Group from './Group';
import { startDrag } from '../reducers/shapes/shape';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../App';
import { Selectable, Draggable, TextEditable } from './Shape';

export type TextProps = {
  type: 'text';
} & Selectable &
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
    <Group
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
    </Group>
  );
});

export default Text;
