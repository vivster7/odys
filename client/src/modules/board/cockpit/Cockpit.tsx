import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../App';
import ZoomLevelDisplay from './ZoomLevelDisplay';
import PositionDisplay from './PositionDisplay';
import { prependOnceListener } from 'cluster';
import { COLORS } from 'modules/draw/mixins/colors/colors';
import KeyToggle from './KeyToggle';

const Cockpit: React.FC = () => {
  const canvasState = useSelector((state: RootState) => state.canvas);
  const { topLeftX, topLeftY, scale, zoomLevel } = canvasState;
  const [isAltPressed, setAltPressed] = useState(false);
  const [isShiftPressed, setShiftPressed] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'AltLeft' || e.code === 'AltRight') {
        setAltPressed(true);
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setShiftPressed(true);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'AltLeft' || e.code === 'AltRight') {
        setAltPressed(false);
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setShiftPressed(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  });

  return (
    <div style={{ display: 'flex', flexFlow: 'column nowrap' }}>
      <ZoomLevelDisplay zoomLevel={zoomLevel}></ZoomLevelDisplay>
      <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
        <KeyToggle isToggled={isShiftPressed} popupText="Select Mode [Shift]">
          ⇧
        </KeyToggle>
        <KeyToggle isToggled={isAltPressed} popupText="Insert Mode [Alt]">
          ⌥
        </KeyToggle>
        <PositionDisplay
          topLeftX={topLeftX}
          topLeftY={topLeftY}
          scale={scale}
        ></PositionDisplay>
      </div>
    </div>
  );
};

export default Cockpit;
