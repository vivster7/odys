import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Cursor, translateCursorPosition } from 'modules/canvas/cursor/cursor';
import { COLORS } from 'global/colors';
import { useDebounce } from 'global/debounce';
import { useCursorMovedEmitter } from 'modules/players/mixins/cursor/cursor';
import { setCursorPosition } from 'modules/canvas/canvas.reducer';
import { OdysDispatch } from 'App';

interface PositionDisplayProps {
  topLeftX: number;
  topLeftY: number;
  scale: number;
}

function onPointerMove(
  dispatch: OdysDispatch,
  topLeftX: number,
  topLeftY: number,
  scale: number,
  setCursor: React.Dispatch<React.SetStateAction<Cursor>>
) {
  return (e: PointerEvent) => {
    const { x, y } = translateCursorPosition(
      e.clientX,
      e.clientY,
      topLeftX,
      topLeftY,
      scale
    );
    setCursor({ x, y });
    dispatch(setCursorPosition({ x, y }));
  };
}

const PositionDisplay: React.FC<PositionDisplayProps> = (props) => {
  const dispatch = useDispatch();
  const [cursor, setCursor] = useState<Cursor>({ x: 0, y: 0 });
  const { topLeftX, topLeftY, scale } = props;

  useEffect(() => {
    const pointerMoveFn = onPointerMove(
      dispatch,
      topLeftX,
      topLeftY,
      scale,
      setCursor
    );
    window.addEventListener('pointermove', pointerMoveFn);
    return () => window.removeEventListener('pointermove', pointerMoveFn);
  }, [dispatch, topLeftX, topLeftY, scale]);

  const debouncedCursor = useDebounce(cursor, 10);
  useCursorMovedEmitter(debouncedCursor);

  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'row nowrap',
        backgroundColor: 'white',
        borderRadius: '4px',
        boxShadow: `0px 4px 2px -2px ${COLORS.dropShadow}`,
        padding: '12px',
        minWidth: '100px',
        maxWidth: '200px',
        justifyContent: 'space-around',
        fontSize: '12px',
        color: COLORS.secondaryText,
        fontWeight: 600,
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
