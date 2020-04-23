import React, { useState, useEffect, ReactSVG } from 'react';
import plus from '../plus.svg';
import minus from '../minus.svg';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../App';
import { changeZoomLevel, dirtySvg } from '../reducers/svg';

interface Cursor {
  x: number;
  y: number;
}

interface PositionDisplayProps {
  topLeftX: number;
  topLeftY: number;
  scale: number;
}

interface ZoomLevelDisplayProps {
  zoomLevel: number;
}

function onMouseMove(
  topLeftX: number,
  topLeftY: number,
  scale: number,
  setCursor: React.Dispatch<React.SetStateAction<Cursor>>
) {
  return (e: MouseEvent) => {
    const x = (e.clientX - topLeftX) / scale;
    const y = (e.clientY - topLeftY) / scale;
    setCursor({ x, y });
  };
}

const Cockpit: React.FC = () => {
  const svgState = useSelector((state: RootState) => state.svg);
  const { topLeftX, topLeftY, scale, zoomLevel } = svgState;

  const PositionDisplay: React.FC<PositionDisplayProps> = (props) => {
    const [cursor, setCursor] = useState<Cursor>({ x: 0, y: 0 });
    const { topLeftX, topLeftY, scale } = props;

    useEffect(() => {
      const mouseMoveFn = onMouseMove(topLeftX, topLeftY, scale, setCursor);
      window.addEventListener('mousemove', mouseMoveFn);
      return () => window.removeEventListener('mousemove', mouseMoveFn);
    }, [topLeftX, topLeftY, scale, setCursor]);

    return (
      <div
        style={{
          display: 'flex',
          flexFlow: 'row nowrap',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0px 4px 2px -2px grey',
          border: '1px rgba(204,204,204,0.5) solid',
          padding: '12px',
          minWidth: '100px',
          maxWidth: '200px',
          justifyContent: 'space-around',
          fontSize: '12px',
        }}
      >
        <p
          style={{
            borderTopLeftRadius: '8px',
            borderBottomLeftRadius: '8px',
            backgroundColor: 'white',
          }}
        >
          {cursor.x.toFixed(2)}
        </p>
        <p
          style={{
            borderLeft: '1px rgba(204, 204, 204, 0.5) solid',
            margin: '-3px 5px',
          }}
        ></p>
        <p
          style={{
            borderTopRightRadius: '8px',
            borderBottomRightRadius: '8px',
            backgroundColor: 'white',
          }}
        >
          {cursor.y.toFixed(2)}
        </p>
      </div>
    );
  };

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
