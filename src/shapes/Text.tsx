import React, { useContext } from 'react';
import Group from './Group';
import { startDrag } from '../reducers/shape';
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

const Text: React.FC<TextProps> = (props) => {
  const transform = `translate(${props.x}, ${props.y})`;
  const drag = useSelector((state: RootState) => state.shapes.drag);
  const dispatch = useDispatch();

  const cursor = drag && drag.id === props.id ? 'grabbing' : 'grab';

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
};

export default Text;
