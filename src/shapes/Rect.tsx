import React, { useContext } from 'react';
import Group from './Group';
import { GlobalStateContext, Anchor } from '../globals';

export const RECT_WIDTH = 200;
export const RECT_HEIGHT = 100;

export interface RectProps extends React.SVGProps<SVGRectElement> {
  type: 'rect';
  id: string;

  x: number;
  y: number;
  translateX: number;
  translateY: number;

  width: number;
  height: number;
  deltaWidth: number;
  deltaHeight: number;

  text: string;
}

const Rect: React.FC<RectProps> = props => {
  const id = props.id;
  const [x, y] = [props.x, props.y];
  const [textX, textY] = [
    (props.width + props.deltaWidth) / 2,
    (props.height + props.deltaHeight) / 2
  ];

  const transform = `translate(${x + props.translateX}, ${y +
    props.translateY})`;
  const { globalState, dispatch } = useContext(GlobalStateContext);
  const cursor =
    globalState.drag && globalState.drag.id === id ? 'grabbing' : 'grab';

  const isSelected = id === globalState.selectedId;

  function startDrag(e: React.MouseEvent) {
    dispatch({
      type: 'ODYS_START_DRAG_ACTION',
      id: id,
      clickX: e.clientX,
      clickY: e.clientY
    });
  }

  function select(e: React.MouseEvent) {
    dispatch({
      type: 'ODYS_SELECT_ACTION',
      id: id
    });
  }

  function selectAndStartDrag(e: React.MouseEvent) {
    e.stopPropagation();
    startDrag(e);
    select(e);
  }

  const SelectionCircles = () => {
    function startResizeRect(e: React.MouseEvent, anchor: Anchor) {
      e.stopPropagation();
      dispatch({
        type: 'ODYS_START_RESIZE_SHAPE_ACTION',
        id: id,
        anchor: anchor,
        originalX: e.clientX,
        originalY: e.clientY
      });
    }

    return (
      <>
        <circle
          fill="cornflowerblue"
          r="4"
          onMouseDown={e => startResizeRect(e, 'NWAnchor')}
        ></circle>
        <circle
          fill="cornflowerblue"
          r="4"
          onMouseDown={e => startResizeRect(e, 'NEAnchor')}
          cx={props.width + props.deltaWidth}
        ></circle>
        <circle
          fill="cornflowerblue"
          r="4"
          onMouseDown={e => startResizeRect(e, 'SWAnchor')}
          cy={props.height + props.deltaHeight}
        ></circle>
        <circle
          fill="cornflowerblue"
          r="4"
          onMouseDown={e => startResizeRect(e, 'SEAnchor')}
          cx={props.width + props.deltaWidth}
          cy={props.height + props.deltaHeight}
        ></circle>
      </>
    );
  };

  return (
    <Group
      id={id}
      transform={transform}
      cursor={cursor}
      onClick={e => e.stopPropagation()}
    >
      <rect
        width={props.width + props.deltaWidth}
        height={props.height + props.deltaHeight}
        rx="4"
        ry="4"
        fill="white"
        stroke={isSelected ? 'cornflowerblue' : 'darkgray'}
        strokeDasharray={isSelected ? 5 : 0}
        onMouseDown={e => selectAndStartDrag(e)}
      ></rect>
      <text
        x={textX}
        y={textY}
        style={{ textAnchor: 'middle' }}
        onMouseDown={e => selectAndStartDrag(e)}
      >
        <tspan style={{ userSelect: 'none' }}>{props.text}</tspan>
      </text>
      {isSelected && <SelectionCircles></SelectionCircles>}
    </Group>
  );
};

export default Rect;
