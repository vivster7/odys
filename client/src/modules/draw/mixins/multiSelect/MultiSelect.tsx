import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'global/redux';
import { COLORS } from 'global/colors';
import { endDrag } from 'modules/draw/shape/mixins/drag/drag.reducer';
import { selectClickTarget } from 'modules/draw/draw.reducer';
import {
  cursorWithinEpsilon,
  translateCursorPosition,
} from 'modules/canvas/cursor/cursor';

interface MultiDragState {
  startX: number;
  startY: number;
  x: number;
  y: number;
}

const MultiSelect: React.FC = () => {
  const dispatch = useDispatch();
  const selectedShapeIds = useSelector(
    (s) => s.draw.multiSelect?.selectedShapeIds
  );
  const selectionRect = useSelector((s) => s.draw.multiSelect?.selectionRect);
  const selectionOutline = useSelector((s) => s.draw.multiSelect?.outline);
  const [canvasScale, canvasTopLeftX, canvasTopLeftY] = useSelector((s) => [
    s.canvas.scale,
    s.canvas.topLeftX,
    s.canvas.topLeftY,
  ]);
  const borderPadding = 20 / canvasScale;
  const dashArray = 5 / canvasScale;
  const borderWidth = 2 / canvasScale;

  const [multiDrag, setMultiDrag] = useState<MultiDragState | null>(null);

  function handlePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    setMultiDrag({ startX: e.clientX, startY: e.clientY, x: 0, y: 0 });
  }

  function handlePointerMove(e: PointerEvent) {
    e.preventDefault();
    if (!multiDrag) return;
    setMultiDrag({
      ...multiDrag,
      x: (e.clientX - multiDrag.startX) / canvasScale,
      y: (e.clientY - multiDrag.startY) / canvasScale,
    });
  }

  function handlePointerUp(e: PointerEvent) {
    e.preventDefault();
    if (multiDrag && selectedShapeIds) {
      if (
        cursorWithinEpsilon(
          multiDrag.startX,
          multiDrag.startY,
          e.clientX,
          e.clientY,
          canvasScale
        )
      ) {
        const { x, y } = translateCursorPosition(
          e.clientX,
          e.clientY,
          canvasTopLeftX,
          canvasTopLeftY,
          canvasScale
        );
        dispatch(
          selectClickTarget({
            x: x,
            y: y,
            shiftKey: e.shiftKey,
          })
        );
      } else {
        dispatch(
          endDrag({
            ids: Object.keys(selectedShapeIds),
            translateX: multiDrag.x,
            translateY: multiDrag.y,
          })
        );
      }
    }

    setMultiDrag(null);
  }

  useEffect(() => {
    if (!multiDrag) return;

    window.addEventListener('pointermove', handlePointerMove, {
      capture: true,
    });
    window.addEventListener('pointerup', handlePointerUp, { capture: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove, {
        capture: true,
      });
      window.removeEventListener('pointerup', handlePointerUp, {
        capture: true,
      });
    };
  });

  if (selectionRect) {
    return (
      <rect
        x={selectionRect.x}
        y={selectionRect.y}
        width={selectionRect.width}
        height={selectionRect.height}
        fill={COLORS.selectionArea}
        fillOpacity="0.1"
        stroke={COLORS.selectionInProgress}
        strokeWidth={borderWidth + 'px'}
      ></rect>
    );
  } else if (selectionOutline) {
    return (
      <rect
        x={
          selectionOutline.x - borderPadding + ((multiDrag && multiDrag.x) || 0)
        }
        y={
          selectionOutline.y - borderPadding + ((multiDrag && multiDrag.y) || 0)
        }
        width={selectionOutline.width + borderPadding + borderPadding}
        height={selectionOutline.height + borderPadding + borderPadding}
        fill="white"
        fillOpacity="0"
        stroke={COLORS.selectionArea}
        strokeDasharray={dashArray + 'px'}
        strokeWidth={borderWidth + 'px'}
        cursor="grab"
        onPointerDown={(e) => handlePointerDown(e)}
      ></rect>
    );
  }
  return <></>;
};

export default MultiSelect;
