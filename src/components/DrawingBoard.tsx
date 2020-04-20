import React, { useEffect } from 'react';
import Svg from '../shapes/Svg';
import Rect, { RectProps, RECT_HEIGHT, RECT_WIDTH } from '../shapes/Rect';
import { v4 } from 'uuid';
import Arrow, { ArrowProps } from '../shapes/Arrow';
import Shape from '../shapes/Shape';
import Line, { LineProps } from '../shapes/Line';
import Text, { TextProps } from '../shapes/Text';
import HiddenTextInput from './HiddenTextInput';
import { useDispatch, useSelector } from 'react-redux';
import { addShape, deleteShape } from '../reducers/shapes/shape';
import { RootState } from '../App';

const id = () => `id-${v4()}`;

const DrawingBoard: React.FC = () => {
  const dispatch = useDispatch();
  const { shapes } = useSelector((state: RootState) => state);
  const select = useSelector((state: RootState) => state.shapes.select);
  const svg = useSelector((state: RootState) => state.svg);

  // temp seed data
  if (Object.entries(shapes.data).length === 0) {
    const rect1Id = id();
    const rect2Id = id();

    const arrow = {
      type: 'arrow',
      id: id(),
      fromId: rect1Id,
      toId: rect2Id,
    };

    dispatch(
      addShape({
        type: 'rect',
        id: rect1Id,
        text: 'A',
        x: 400,
        y: 200,
        translateX: 0,
        translateY: 0,
        width: RECT_WIDTH,
        height: RECT_HEIGHT,
        deltaWidth: 0,
        deltaHeight: 0,
      })
    );
    dispatch(
      addShape({
        type: 'rect',
        id: rect2Id,
        text: 'B',
        x: 400,
        y: 400,
        translateX: 0,
        translateY: 0,
        width: RECT_WIDTH,
        height: RECT_HEIGHT,
        deltaWidth: 0,
        deltaHeight: 0,
      })
    );
    dispatch(addShape(arrow as ArrowProps));
  }

  // add delete key handler
  function onKeyDownHandler(e: KeyboardEvent) {
    if (e.code === 'Backspace' && select && select.isEditing === false) {
      dispatch(deleteShape(select.id));
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

  const selectedShape =
    shapes.select && (shapes.data[shapes.select.id] as RectProps);

  return (
    <>
      <Svg
        topLeftX={svg.topLeftX}
        topLeftY={svg.topLeftY}
        translateX={svg.translateX}
        translateY={svg.translateY}
        scale={svg.scale}
      >
        {shapes.shapeOrder.map((id) => renderShape(shapes.data[id]))}
      </Svg>
      <div style={{ opacity: 0, display: 'flex', flex: '0 0', height: '0px' }}>
        {selectedShape && (
          <HiddenTextInput selectedShape={selectedShape}></HiddenTextInput>
        )}
      </div>
    </>
  );
};

export default DrawingBoard;
