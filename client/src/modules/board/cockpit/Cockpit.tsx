import React from 'react';
import { useSelector } from 'global/redux';
import ZoomLevelDisplay from './ZoomLevelDisplay';
import PositionDisplay from './PositionDisplay';

const Cockpit: React.FC = () => {
  const canvasState = useSelector((s) => s.canvas);
  const { topLeftX, topLeftY, scale, zoomLevel } = canvasState;

  return (
    <div style={{ display: 'flex', flexFlow: 'column nowrap' }}>
      <ZoomLevelDisplay zoomLevel={zoomLevel}></ZoomLevelDisplay>
      <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
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
