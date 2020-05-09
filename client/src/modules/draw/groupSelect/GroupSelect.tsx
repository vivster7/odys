import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../App';
import { endGroupDrag } from '../draw.reducer';

interface GroupDragState {
  startX: number;
  startY: number;
  x: number;
  y: number;
}

const GroupSelect: React.FC = () => {
  const dispatch = useDispatch();
  const selectionRect = useSelector(
    (state: RootState) => state.shapes.groupSelect?.selectionRect
  );
  const selectionOutline = useSelector(
    (state: RootState) => state.shapes.groupSelect?.outline
  );
  const svgScale = useSelector((state: RootState) => state.svg.scale);
  const borderPadding = 20 / svgScale;
  const dashArray = 5 / svgScale;

  const [groupDrag, setGroupDrag] = useState<GroupDragState | null>(null);

  function handleMouseDown(e: React.MouseEvent) {
    e.stopPropagation();
    setGroupDrag({ startX: e.clientX, startY: e.clientY, x: 0, y: 0 });
  }

  function handleMouseMove(e: MouseEvent) {
    if (!groupDrag) return;
    setGroupDrag({
      ...groupDrag,
      x: (e.clientX - groupDrag.startX) / svgScale,
      y: (e.clientY - groupDrag.startY) / svgScale,
    });
  }

  function handleMouseUp(e: MouseEvent) {
    dispatch(
      endGroupDrag({
        translateX: (groupDrag && groupDrag.x) || 0,
        translateY: (groupDrag && groupDrag.y) || 0,
      })
    );
    setGroupDrag(null);
  }

  useEffect(() => {
    if (!groupDrag) return;

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
        fill="#b3d4fc30"
        stroke="blue"
      ></rect>
    );
  } else if (selectionOutline) {
    return (
      <rect
        x={
          selectionOutline.x - borderPadding + ((groupDrag && groupDrag.x) || 0)
        }
        y={
          selectionOutline.y - borderPadding + ((groupDrag && groupDrag.y) || 0)
        }
        width={selectionOutline.width + borderPadding + borderPadding}
        height={selectionOutline.height + borderPadding + borderPadding}
        fill="white"
        fillOpacity="0"
        stroke="black"
        strokeDasharray={dashArray + 'px'}
        cursor="grab"
        onMouseDown={(e) => handleMouseDown(e)}
      ></rect>
    );
  }
  return <></>;
};

export default GroupSelect;
