import React, { useContext } from 'react';
import { GlobalStateContext } from '../globals';
import plus from '../plus.svg';
import minus from '../minus.svg';

interface PositionDisplayProps {
  x: string;
  y: string;
}

const Cockpit: React.FC = props => {
  const { globalState } = useContext(GlobalStateContext);

  const PositionDisplay: React.FC<PositionDisplayProps> = props => {
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
          fontSize: '12px'
        }}
      >
        <p
          style={{
            borderTopLeftRadius: '8px',
            borderBottomLeftRadius: '8px',
            backgroundColor: 'white'
          }}
        >
          {props.x}
        </p>
        <p
          style={{
            borderLeft: '1px rgba(204, 204, 204, 0.5) solid',
            margin: '-3px 5px'
          }}
        ></p>
        <p
          style={{
            borderTopRightRadius: '8px',
            borderBottomRightRadius: '8px',
            backgroundColor: 'white'
          }}
        >
          {props.y}
        </p>
      </div>
    );
  };

  const ZoomLevelDisplay: React.FC = () => {
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
          marginBottom: '5px'
        }}
      >
        <img src={plus} alt="+" style={{ height: '12px', padding: '4px' }} />
        <p
          style={{
            borderTop: '1px rgba(204, 204, 204, 0.5) solid',
            borderBottom: '1px rgba(204, 204, 204, 0.5) solid',
            padding: '6px',
            margin: '3px -1px',
            fontSize: '14px'
          }}
        >
          5
        </p>
        <img src={minus} alt="-" style={{ height: '12px', padding: '4px' }} />
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexFlow: 'column nowrap' }}>
      <ZoomLevelDisplay></ZoomLevelDisplay>
      <PositionDisplay
        x={globalState.svg.topLeftX.toFixed(2)}
        y={globalState.svg.topLeftY.toFixed(2)}
      ></PositionDisplay>
    </div>
  );
};

export default Cockpit;
