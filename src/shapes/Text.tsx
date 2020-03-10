import React, { useContext } from 'react';
import Group from './Group';
import { GlobalStateContext } from '../globals';

export interface TextProps extends React.SVGProps<SVGTextElement> {
  type: 'text';
  id: string;
  x: number;
  y: number;
  text: string;
  translateX: number;
  translateY: number;
}

const Text: React.FC<TextProps> = props => {
  const transform = `translate(${props.x}, ${props.y})`;
  const { globalState, dispatch } = useContext(GlobalStateContext);
  const cursor = globalState.dragId === props.id ? 'grabbing' : 'grab';

  function startDrag(e: React.MouseEvent) {
    dispatch({
      type: 'ODYS_START_DRAG_ACTION',
      id: props.id,
      clickX: e.clientX,
      clickY: e.clientY
    });
  }

  return (
    <Group
      id={props.id}
      transform={transform}
      cursor={cursor}
      onMouseDown={e => startDrag(e)}
    >
      <text style={{ textAnchor: 'middle' }}>
        <tspan>{props.text}</tspan>
      </text>
    </Group>
  );
};

export default Text;
