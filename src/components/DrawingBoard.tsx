import React from 'react';
import Svg from './Svg';
import { RectProps, RECT_HEIGHT, RECT_WIDTH } from '../shapes/Rect';
import { v4 } from 'uuid';
import HiddenTextInput from './HiddenTextInput';
import { useDispatch, useSelector } from 'react-redux';
import { addShape } from '../reducers/shapes/shape';
import { RootState } from '../App';
import { ArrowProps } from '../shapes/Arrow';

const id = () => `id-${v4()}`;

const DrawingBoard: React.FC = () => {
  const dispatch = useDispatch();
  const shapes = useSelector((state: RootState) => state.shapes);

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

    const rect1 = {
      type: 'rect',
      id: rect1Id,
      text: 'A',
      x: 100,
      y: 150,
      translateX: 0,
      translateY: 0,
      width: RECT_WIDTH,
      height: RECT_HEIGHT,
      deltaWidth: 0,
      deltaHeight: 0,
    } as RectProps;

    const rect2 = {
      type: 'rect',
      id: rect2Id,
      text: 'B',
      x: 400,
      y: 150,
      translateX: 0,
      translateY: 0,
      width: RECT_WIDTH,
      height: RECT_HEIGHT,
      deltaWidth: 0,
      deltaHeight: 0,
    } as RectProps;

    dispatch(addShape(rect1));
    dispatch(addShape(rect2));
    dispatch(addShape(arrow as ArrowProps));
  }

  return (
    <>
      <Svg></Svg>
      <div style={{ opacity: 0, display: 'flex', flex: '0 0', height: '0px' }}>
        <HiddenTextInput></HiddenTextInput>
      </div>
    </>
  );
};

export default DrawingBoard;
