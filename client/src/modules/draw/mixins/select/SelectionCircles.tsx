import React from 'react';
import { startResize } from 'modules/draw/draw.reducer';
import { useDispatch } from 'react-redux';
import { Anchor } from 'modules/draw/shape/mixins/resize/resize.reducer';
import { COLORS } from 'global/colors';

interface SelectionCirclesProps {
  id: string;
  createdAtZoomLevel: number;
  width: number;
  height: number;
}

const SelectionCircles: React.FC<SelectionCirclesProps> = (props) => {
  const dispatch = useDispatch();
  const radiusSize = 5;

  function onPointerDown(e: React.PointerEvent, anchor: Anchor) {
    e.stopPropagation();
    e.preventDefault();
    dispatch(
      startResize({
        id: props.id,
        anchor,
        prevX: e.clientX,
        prevY: e.clientY,
      })
    );
  }

  const color = props.id === '' ? COLORS.ghost : COLORS.select;

  return (
    <>
      <circle
        fill={color}
        r={radiusSize + 'px'}
        cursor="nw-resize"
        onPointerDown={(e) => onPointerDown(e, 'NWAnchor')}
      ></circle>
      <circle
        fill={color}
        r={radiusSize + 'px'}
        cursor="ne-resize"
        onPointerDown={(e) => onPointerDown(e, 'NEAnchor')}
        cx={props.width}
      ></circle>
      <circle
        fill={color}
        r={radiusSize + 'px'}
        cursor="sw-resize"
        onPointerDown={(e) => onPointerDown(e, 'SWAnchor')}
        cy={props.height}
      ></circle>
      <circle
        fill={color}
        r={radiusSize + 'px'}
        cursor="se-resize"
        onPointerDown={(e) => onPointerDown(e, 'SEAnchor')}
        cx={props.width}
        cy={props.height}
      ></circle>
    </>
  );
};

export default SelectionCircles;
