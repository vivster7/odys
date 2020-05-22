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

  function onMouseDown(e: React.MouseEvent, anchor: Anchor) {
    e.stopPropagation();
    dispatch(
      startResize({
        id: props.id,
        anchor,
        originalX: e.clientX,
        originalY: e.clientY,
      })
    );
  }

  return (
    <>
      <circle
        fill={COLORS.select}
        r={radiusSize + 'px'}
        cursor="nw-resize"
        onMouseDown={(e) => onMouseDown(e, 'NWAnchor')}
      ></circle>
      <circle
        fill={COLORS.select}
        r={radiusSize + 'px'}
        cursor="ne-resize"
        onMouseDown={(e) => onMouseDown(e, 'NEAnchor')}
        cx={props.width}
      ></circle>
      <circle
        fill={COLORS.select}
        r={radiusSize + 'px'}
        cursor="sw-resize"
        onMouseDown={(e) => onMouseDown(e, 'SWAnchor')}
        cy={props.height}
      ></circle>
      <circle
        fill={COLORS.select}
        r={radiusSize + 'px'}
        cursor="se-resize"
        onMouseDown={(e) => onMouseDown(e, 'SEAnchor')}
        cx={props.width}
        cy={props.height}
      ></circle>
    </>
  );
};

export default SelectionCircles;
