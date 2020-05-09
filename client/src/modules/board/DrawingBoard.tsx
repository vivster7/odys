import React from 'react';
import Svg from '../svg/Svg';
import { RECT_HEIGHT, RECT_WIDTH, RectProps } from '../draw/shapes/Rect';
import { v4 } from 'uuid';
import HiddenTextInput from '../draw/editText/HiddenTextInput';
import { useDispatch, useSelector } from 'react-redux';
import { addShape } from '../draw/draw.reducer';
import { RootState } from '../../App';
import { ArrowProps } from '../draw/shapes/Arrow';
import Cockpit from './cockpit/Cockpit';
import ToastContainer from '../errors/ToastContainer';

const id = () => `id-${v4()}`;

const DrawingBoard: React.FC = () => {
  const dispatch = useDispatch();
  const shapes = useSelector((state: RootState) => state.shapes);

  // temp seed data
  if (Object.entries(shapes.data).length === 0) {
    const rect1Id = '1';
    const rect2Id = '2';

    const arrow: ArrowProps = {
      type: 'arrow',
      id: id(),
      fromId: rect1Id,
      toId: rect2Id,
      text: '',
      createdAtZoomLevel: 5,
      isLastUpdatedBySync: false,
    };

    const rect = (
      id: string,
      text: string,
      x: number,
      y: number
    ): RectProps => {
      return {
        type: 'rect',
        id: id,
        text: text,
        x: x,
        y: y,
        translateX: 0,
        translateY: 0,
        width: RECT_WIDTH,
        height: RECT_HEIGHT,
        deltaWidth: 0,
        deltaHeight: 0,
        isGroupingRect: false,
        createdAtZoomLevel: 5,
        isLastUpdatedBySync: false,
      };
    };
    dispatch(addShape(rect('1', 'A', 150, 100)));
    dispatch(addShape(rect('2', 'B', 400, 100)));
  }

  return (
    <>
      <Svg></Svg>
      <div style={{ opacity: 0, display: 'flex', flex: '0 0', height: '0px' }}>
        <HiddenTextInput></HiddenTextInput>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
        }}
      >
        <Cockpit></Cockpit>
      </div>
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
        }}
      >
        <ToastContainer></ToastContainer>
      </div>
    </>
  );
};

export default DrawingBoard;
