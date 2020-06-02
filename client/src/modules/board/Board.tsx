import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'global/redux';

import HiddenTextInput from 'modules/draw/mixins/editText/HiddenTextInput';
import ToastContainer from 'modules/errors/ToastContainer';
import Canvas from 'modules/canvas/Canvas';
import LandingPage from './landing/LandingPage';
import KeyTooltips from './tooltip/KeyTooltips';
import { COLORS } from 'global/colors';

import Cockpit from './cockpit/Cockpit';
import { getOrCreateBoard } from './board.reducer';
import OnlinePlayers from 'modules/players/OnlinePlayers';

const BoardLoading: React.FC = () => (
  <div
    style={{
      height: '100%',
      width: '100%',
      background: COLORS.canvas,
    }}
  ></div>
);

const BoardFailed: React.FC = () => (
  <div
    style={{
      height: '100%',
      width: '100%',
      background: COLORS.appBg,
    }}
  >
    <h1>Could not load</h1>
  </div>
);

const DrawingBoard: React.FC = () => {
  const dispatch = useDispatch();
  const board = useSelector((s) => s.board);
  const room = useSelector((s) => s.room);

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
      <LandingPage></LandingPage>
      <div style={{ opacity: 0, display: 'flex', flex: '0 0', height: '0px' }}>
        <HiddenTextInput></HiddenTextInput>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          pointerEvents: 'none',
        }}
      >
        <Cockpit></Cockpit>
      </div>
      <div
        style={{
          position: 'absolute',
          left: '15px',
          bottom: '10px',
          pointerEvents: 'none',
        }}
      >
        <KeyTooltips />
      </div>
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          pointerEvents: 'none',
        }}
      >
        <OnlinePlayers></OnlinePlayers>
      </div>
      <div
        style={{
          position: 'absolute',
          top: '40px',
          right: '10px',
          pointerEvents: 'none',
        }}
      >
        <ToastContainer></ToastContainer>
      </div>
    </>
  );
};

export default DrawingBoard;
