import React from 'react';
import Group from './Group';
import { startDrag } from '../reducers/shapes/shape';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../App';

export interface TextProps extends React.SVGProps<SVGTextElement> {
  type: 'text';
  id: string;
  x: number;
  y: number;
  text: string;
  translateX: number;
  translateY: number;
}

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
