import React from 'react';
import plus from './plus.svg';
import minus from './minus.svg';
import { useDispatch } from 'react-redux';
import { changeZoomLevel, dirtySvg } from '../../svg/svg.reducer';

interface ZoomLevelDisplayProps {
  zoomLevel: number;
}

const ZoomLevelDisplay: React.FC<ZoomLevelDisplayProps> = (props) => {
  const dispatch = useDispatch();
  const { zoomLevel } = props;

  function incrementZoomLevel() {
    dispatch(changeZoomLevel({ zoomLevel: zoomLevel + 1 }));
    dispatch(dirtySvg());
  }

  function decrementZoomLevel() {
    dispatch(changeZoomLevel({ zoomLevel: zoomLevel - 1 }));
    dispatch(dirtySvg());
  }

  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column nowrap',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0px 4px 2px -2px grey',
        border: '1px rgba(204,204,204,0.5) solid',
        padding: '6px',
        justifyContent: 'space-around',
        fontSize: '18px',
        alignSelf: 'flex-end',
        marginBottom: '5px',
      }}
    >
      <img
        src={plus}
        alt="+"
        style={{ height: '12px', padding: '4px' }}
        onClick={() => incrementZoomLevel()}
      />
      <p
        style={{
          borderTop: '1px rgba(204, 204, 204, 0.5) solid',
          borderBottom: '1px rgba(204, 204, 204, 0.5) solid',
          padding: '6px',
          margin: '3px -1px',
          fontSize: '14px',
        }}
      >
        {zoomLevel}
      </p>
      <img
        src={minus}
        alt="-"
        style={{ height: '12px', padding: '4px' }}
        onClick={() => decrementZoomLevel()}
      />
    </div>
  );
};

export default ZoomLevelDisplay;
