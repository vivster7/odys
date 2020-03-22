import React, { useContext, useEffect } from 'react';
import Svg from '../shapes/Svg';
import Rect, { RectProps, RECT_HEIGHT, RECT_WIDTH } from '../shapes/Rect';
import { v4 } from 'uuid';
import { GlobalStateContext } from '../globals';
import Arrow, { ArrowProps } from '../shapes/Arrow';
import Shape from '../shapes/Shape';
import Line, { LineProps } from '../shapes/Line';
import Text, { TextProps } from '../shapes/Text';
import HiddenTextInput from './HiddenTextInput';

const id = () => `id-${v4()}`;

const DrawingBoard: React.FC = () => {
  const { globalState, dispatch } = useContext(GlobalStateContext);

  // temp seed data
  if (globalState.shapes.length === 0) {
    dispatch({
      type: 'ODYS_ADD_SHAPE_ACTION',
      shape: {
        type: 'rect',
        id: id(),
        text: 'A',
        x: 0,
        y: 0,
        translateX: 0,
        translateY: 0,
        width: RECT_WIDTH,
        height: RECT_HEIGHT,
        deltaWidth: 0,
        deltaHeight: 0
      }
    });
    dispatch({
      type: 'ODYS_ADD_SHAPE_ACTION',
      shape: {
        type: 'rect',
        id: id(),
        text: 'C',
        x: 400,
        y: 400,
        translateX: 0,
        translateY: 0,
        width: RECT_WIDTH,
        height: RECT_HEIGHT,
        deltaWidth: 0,
        deltaHeight: 0
      }
    });
    dispatch({
      type: 'ODYS_ADD_SHAPE_ACTION',
      shape: {
        type: 'rect',
        id: id(),
        text: 'B',
        x: 200,
        y: 200,
        translateX: 0,
        translateY: 0,
        width: RECT_WIDTH,
        height: RECT_HEIGHT,
        deltaWidth: 0,
        deltaHeight: 0
      }
    });
    dispatch({
      type: 'ODYS_ADD_SHAPE_ACTION',
      shape: {
        type: 'arrow',
        id: id(),
        x: 0,
        y: 0,
        x1: 200,
        y1: 200,
        x2: 300,
        y2: 300,
        left: true,
        right: false,
        translateX: 0,
        translateY: 0
      }
    });
    dispatch({
      type: 'ODYS_ADD_SHAPE_ACTION',
      shape: {
        type: 'line',
        id: id(),
        x1: 0,
        y1: 0,
        x2: 150,
        y2: 0,
        translateX: 0,
        translateY: 0
      }
    });
    dispatch({
      type: 'ODYS_ADD_SHAPE_ACTION',
      shape: {
        type: 'text',
        id: id(),
        text: 'Hello Face',
        x: 200,
        y: 300,
        translateX: 0,
        translateY: 0
      }
    });
  }

  // add delete key handler
  function onKeyDownHandler(e: KeyboardEvent) {
    if (e.code === 'Backspace' && globalState.selectedId) {
      dispatch({
        type: 'ODYS_DELETE_SHAPE_ACTION',
        id: globalState.selectedId
      });
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', onKeyDownHandler);
    return () => {
      window.removeEventListener('keydown', onKeyDownHandler);
    };
  });

  function renderShape(shape: Shape) {
    const { type, ...rest } = shape;
    switch (type) {
      case 'rect':
        return <Rect key={rest.id} {...(rest as RectProps)}></Rect>;

      case 'arrow':
        return <Arrow key={rest.id} {...(rest as ArrowProps)}></Arrow>;

      case 'line':
        return <Line key={rest.id} {...(rest as LineProps)}></Line>;

      case 'text':
        return <Text key={rest.id} {...(rest as TextProps)}></Text>;

      default:
        throw new Error(`unknow shape: ${type}`);
    }
  }

  const selectedShapeInd = globalState.shapes.findIndex(
    d => d.id === globalState.selectedId
  );
  const selectedShape = globalState.shapes[selectedShapeInd] as RectProps;

  return (
    <>
      <Svg
        topLeftX={globalState.svg.topLeftX}
        topLeftY={globalState.svg.topLeftY}
        translateX={globalState.svg.translateX}
        translateY={globalState.svg.translateY}
        scale={globalState.svg.scale}
      >
        {globalState.shapes.map(s => renderShape(s))}
      </Svg>
      <div style={{ display: 'hidden' }}>
        {selectedShape && (
          <HiddenTextInput name={selectedShape.id} value={selectedShape.text} />
        )}
      </div>
    </>
  );
};

export default DrawingBoard;
