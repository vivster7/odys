import React, { useContext } from 'react';
import { GlobalStateContext } from '../globals';

const Cockpit: React.FC = props => {
  const { globalState } = useContext(GlobalStateContext);
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
        justifyContent: 'space-around'
      }}
    >
      <p
        style={{
          borderTopLeftRadius: '8px',
          borderBottomLeftRadius: '8px',
          backgroundColor: 'white'
        }}
      >
        {globalState.svg.topLeftX.toFixed(2)}
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
        {globalState.svg.topLeftY.toFixed(2)}
      </p>
    </div>
  );
};

export default Cockpit;
