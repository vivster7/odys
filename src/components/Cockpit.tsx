import React from 'react';
import plus from '../plus.svg';
import minus from '../minus.svg';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../App';
import { changeZoomLevel, dirtySvg } from '../reducers/svg';

interface PositionDisplayProps {
  x: string;
  y: string;
}

const Cockpit: React.FC = React.memo((props) => {
  const dispatch = useDispatch();
  const mouseX = useSelector((state: RootState) => state.mouse.x);
  const mouseY = useSelector((state: RootState) => state.mouse.y);
  const zoomLevel = useSelector((state: RootState) => state.svg.zoomLevel);

  const PositionDisplay: React.FC<PositionDisplayProps> = React.memo(
    (props) => {
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
            {props.x}
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
            {props.y}
          </p>
        </div>
      );
    }
  );

  const ZoomLevelDisplay: React.FC = React.memo(() => {
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
  });

  return (
    <div style={{ display: 'flex', flexFlow: 'column nowrap' }}>
      <ZoomLevelDisplay></ZoomLevelDisplay>
      <PositionDisplay
        x={mouseX.toFixed(2)}
        y={mouseY.toFixed(2)}
      ></PositionDisplay>
    </div>
  );
});

export default Cockpit;
