import React, { useContext } from 'react';
import Svg from './shapes/Svg';
import Rect, { RectProps } from './shapes/Rect';
import { v4 } from 'uuid';
import { GlobalStateContext } from './globals';
import Arrow, { ArrowProps } from './shapes/Arrow';
import Shape from './shapes/Shape';
import Line, { LineProps } from './shapes/Line';
import RightArrowhead, { RightArrowheadProps } from './shapes/RightArrowhead';

const id = () => `id-${v4()}`;

const DrawingBoard: React.FC = () => {
  const { globalState, dispatch } = useContext(GlobalStateContext);

  // temp seed data
  if (globalState.shapes.length === 0) {
    dispatch({
      type: 'ODYS_ADD_SHAPE',
      shape: { type: 'rect', id: id(), text: 'A', x: 0, y: 0 }
    });
    dispatch({
      type: 'ODYS_ADD_SHAPE',
      shape: { type: 'rect', id: id(), text: 'C', x: 400, y: 400 }
    });
    dispatch({
      type: 'ODYS_ADD_SHAPE',
      shape: { type: 'rect', id: id(), text: 'B', x: 200, y: 200 }
    });
    dispatch({
      type: 'ODYS_ADD_SHAPE',
      shape: {
        type: 'arrow',
        id: id(),
        x1: 200,
        y1: 200,
        x2: 300,
        y2: 300,
        left: false,
        right: true
      }
    });
    dispatch({
      type: 'ODYS_ADD_SHAPE',
      shape: { type: 'line', id: id(), x1: 0, y1: 0, x2: 150, y2: 0 }
    });
    dispatch({
      type: 'ODYS_ADD_SHAPE',
      shape: { type: 'right-arrowhead', id: id(), x: 150, y: 0 }
    });
  }

  function renderShape(shape: Shape) {
    const { type, ...rest } = shape;
    switch (type) {
      case 'rect':
        return <Rect key={rest.id} {...(rest as RectProps)}></Rect>;

      case 'arrow':
        return <Arrow key={rest.id} {...(rest as ArrowProps)}></Arrow>;

      case 'line':
        return <Line key={rest.id} {...(rest as LineProps)}></Line>;

      case 'right-arrowhead':
        return (
          <RightArrowhead
            key={rest.id}
            {...(rest as RightArrowheadProps)}
          ></RightArrowhead>
        );

      default:
        throw new Error(`unknow shape: ${type}`);
    }
  }

  return <Svg>{globalState.shapes.map(s => renderShape(s))}</Svg>;
};

export default DrawingBoard;
