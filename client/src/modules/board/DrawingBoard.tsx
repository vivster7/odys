import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from 'App';
import { addShape } from 'modules/draw/draw.reducer';
import HiddenTextInput from 'modules/draw/editText/HiddenTextInput';
import { RECT_HEIGHT, RECT_WIDTH, RectProps } from 'modules/draw/shapes/Rect';
import ToastContainer from 'modules/errors/ToastContainer';
import Svg from 'modules/svg/Svg';
import Cockpit from './cockpit/Cockpit';

const DrawingBoard: React.FC = () => {
  const dispatch = useDispatch();
  const shapes = useSelector((state: RootState) => state.draw);

  // temp seed data
  if (Object.entries(shapes.shapes).length === 0) {
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
