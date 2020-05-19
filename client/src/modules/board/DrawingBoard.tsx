import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from 'App';
import { updateDrawing } from 'modules/draw/draw.reducer';
import HiddenTextInput from 'modules/draw/mixins/editText/HiddenTextInput';
import { RECT_HEIGHT, RECT_WIDTH } from 'modules/draw/shape/type/Rect';
import ToastContainer from 'modules/errors/ToastContainer';
import Canvas from 'modules/canvas/Canvas';

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

  useEffect(() => {
    if (room.loaded !== 'success') return;
    dispatch(getOrCreateBoard(room.id));
  }, [room, dispatch]);

  if (board.loaded === 'failed' || room.loaded === 'failed')
    return <BoardFailed></BoardFailed>;
  if (board.loaded === 'loading') return <BoardLoading></BoardLoading>;
  return (
    <>
      <Canvas></Canvas>
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
