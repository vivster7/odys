import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../App';
import ZoomLevelDisplay from './ZoomLevelDisplay';
import PositionDisplay from './PositionDisplay';

const Cockpit: React.FC = () => {
  const canvasState = useSelector((state: RootState) => state.canvas);
  const { topLeftX, topLeftY, scale, zoomLevel } = canvasState;

  return (
    <div style={{ display: 'flex', flexFlow: 'column nowrap' }}>
      <ZoomLevelDisplay zoomLevel={zoomLevel}></ZoomLevelDisplay>
      <PositionDisplay
        topLeftX={topLeftX}
        topLeftY={topLeftY}
        scale={scale}
      ></PositionDisplay>
    </div>
  );
};

export default Cockpit;
