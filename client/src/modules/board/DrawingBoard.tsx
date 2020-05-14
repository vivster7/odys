import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from 'App';
import { updateDrawing } from 'modules/draw/draw.reducer';
import HiddenTextInput from 'modules/draw/mixins/editText/HiddenTextInput';
import { RECT_HEIGHT, RECT_WIDTH } from 'modules/draw/shape/type/Rect';
import ToastContainer from 'modules/errors/ToastContainer';
import Svg from 'modules/svg/Svg';

import Cockpit from './cockpit/Cockpit';
import { getOrCreateBoard } from './board.reducer';
import { Rect } from 'modules/draw/shape/shape.reducer';

const BoardLoading: React.FC = () => (
  <div
    style={{
      height: '100%',
      width: '100%',
      background: 'var(--odys-background-gray)',
    }}
  ></div>
);

const BoardFailed: React.FC = () => (
  <div
    style={{
      height: '100%',
      width: '100%',
      background: 'rgba(180,160,160,0.6)',
    }}
  >
    <h1>Could not load</h1>
  </div>
);

const DrawingBoard: React.FC = () => {
  const dispatch = useDispatch();
  const board = useSelector((state: RootState) => state.board);
  const room = useSelector((state: RootState) => state.room);
  const shapes = useSelector((state: RootState) => state.draw);

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
        isSavedInDB: true,
        boardId: '1', //TODO
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
      };
    };
    dispatch(updateDrawing(rect('1', 'A', 150, 100)));
    dispatch(updateDrawing(rect('2', 'B', 400, 100)));
  }

  useEffect(() => {
    if (room.loaded !== 'success') return;
    dispatch(getOrCreateBoard(room.id));
  }, [room, dispatch]);

  if (board.loaded === 'failed' || room.loaded === 'failed')
    return <BoardFailed></BoardFailed>;
  if (board.loaded === 'loading') return <BoardLoading></BoardLoading>;
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
