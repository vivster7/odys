import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../App';
import { COLORS } from 'modules/draw/mixins/colors/colors';
import { endMultiDrag } from '../multiDrag/multiDrag.reducer';

interface MultiDragState {
  startX: number;
  startY: number;
  x: number;
  y: number;
}

const MultiSelect: React.FC = () => {
  const dispatch = useDispatch();
  const selectedShapeIds = useSelector(
    (state: RootState) => state.draw.multiSelect?.selectedShapeIds
  );
  const selectionRect = useSelector(
    (state: RootState) => state.draw.multiSelect?.selectionRect
  );
  const selectionOutline = useSelector(
    (state: RootState) => state.draw.multiSelect?.outline
  );
  const canvasScale = useSelector((state: RootState) => state.canvas.scale);
  const borderPadding = 20 / canvasScale;
  const dashArray = 5 / canvasScale;
  const borderWidth = 2 / canvasScale;

  const [multiDrag, setMultiDrag] = useState<MultiDragState | null>(null);

  function handleMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    setMultiDrag({ startX: e.clientX, startY: e.clientY, x: 0, y: 0 });
  }

  function handleMouseMove(e: MouseEvent) {
    if (!multiDrag) return;
    setMultiDrag({
      ...multiDrag,
      x: (e.clientX - multiDrag.startX) / canvasScale,
      y: (e.clientY - multiDrag.startY) / canvasScale,
    });
  }

  function handleMouseUp(e: MouseEvent) {
    if (multiDrag && selectedShapeIds) {
      dispatch(
        endMultiDrag({
          ids: Object.keys(selectedShapeIds),
          translateX: (multiDrag && multiDrag.x) || 0,
          translateY: (multiDrag && multiDrag.y) || 0,
        })
      );
    }
    setMultiDrag(null);
  }

  useEffect(() => {
    if (!multiDrag) return;

    window.addEventListener('mousemove', handleMouseMove, { capture: true });
    window.addEventListener('mouseup', handleMouseUp, { capture: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove, {
        capture: true,
      });
      window.removeEventListener('mouseup', handleMouseUp, { capture: true });
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
        onMouseDown={(e) => handleMouseDown(e)}
      ></rect>
    );
  }
  return <></>;
};

export default MultiSelect;
