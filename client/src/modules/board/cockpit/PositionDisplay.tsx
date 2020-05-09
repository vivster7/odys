import React, { useState, useEffect } from 'react';

interface Cursor {
  x: number;
  y: number;
}

interface PositionDisplayProps {
  topLeftX: number;
  topLeftY: number;
  scale: number;
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

export default PositionDisplay;
