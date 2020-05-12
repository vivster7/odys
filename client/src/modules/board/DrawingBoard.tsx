import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from 'App';
import { addShape, ShapeData } from 'modules/draw/draw.reducer';
import HiddenTextInput from 'modules/draw/editText/HiddenTextInput';
import { RECT_HEIGHT, RECT_WIDTH } from 'modules/draw/shape/type/Rect';
import ToastContainer from 'modules/errors/ToastContainer';
import Svg from 'modules/svg/Svg';
import socket from 'socket/socket';

import Cockpit from './cockpit/Cockpit';
import { getOrCreateBoard } from './board.reducer';
import { Rect } from 'modules/draw/shape/shape.reducer';

function usePreviousShapes(shapes: ShapeData) {
  const ref = useRef({});
  useEffect(() => {
    ref.current = shapes;
  });
  return ref.current;
}

const DrawingBoard: React.FC = () => {
  const dispatch = useDispatch();
  const room = useSelector((state: RootState) => state.room);
  const shapes = useSelector((state: RootState) => state.draw);

  const prevShapes = usePreviousShapes(shapes.shapes);
  useEffect(() => {
    const prevShapeIds = Object.keys(prevShapes);
    const currShapeIds = Object.keys(shapes.shapes);
    if (prevShapeIds.length > currShapeIds.length) {
      const diff = prevShapeIds.filter((x) => !currShapeIds.includes(x));
      socket.emit('shapeDeleted', diff[0]);
    }
  });

  // temp seed data
  if (Object.entries(shapes.shapes).length === 0) {
    const rect = (id: string, text: string, x: number, y: number): Rect => {
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
        createdAtZoomLevel: 5,
        isLastUpdatedBySync: false,
        boardId: '1', //TODO
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    };
    dispatch(addShape(rect('1', 'A', 150, 100)));
    dispatch(addShape(rect('2', 'B', 400, 100)));
  }

  useEffect(() => {
    if (room.loaded !== 'success') return;
    dispatch(getOrCreateBoard(room.id));
  }, [room, dispatch]);

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
