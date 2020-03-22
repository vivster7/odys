import React, { useContext, useEffect, useRef } from 'react';
import Svg from '../shapes/Svg';
import Rect, { RectProps, RECT_HEIGHT, RECT_WIDTH } from '../shapes/Rect';
import { v4 } from 'uuid';
import { GlobalStateContext } from '../globals';
import Arrow, { ArrowProps } from '../shapes/Arrow';
import Shape from '../shapes/Shape';
import Line, { LineProps } from '../shapes/Line';
import Text, { TextProps } from '../shapes/Text';
import Input from './Input';

const id = () => `id-${v4()}`;

export interface HiddenTextInputProps {
  name: string;
  value: string;
}

const HiddenTextInput: React.FC<HiddenTextInputProps> = props => {
  const { dispatch } = useContext(GlobalStateContext);
  const { name, value } = props;
  const inputEl = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputEl && inputEl.current) {
      inputEl.current.focus();
    }
  });

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: 'ODYS_SELECTED_SHAPE_INPUT_CHANGE_ACTION',
      id: name,
      text: event.target.value
    });
  };

  return (
    <>
      <input
        ref={inputEl}
        type="text"
        name={name}
        value={value}
        onChange={onInputChange}
      />
    </>
  );
};

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
      {/* <Input x={0} y={0} text=""></Input> */}
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
