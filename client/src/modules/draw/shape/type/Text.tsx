import React from 'react';
import { startDrag } from '../../draw.reducer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../App';
import { ShapeId } from '../Shape';

const Text: React.FC<ShapeId> = React.memo((props) => {
  const { id } = props;
  const dispatch = useDispatch();

  const text = useSelector((state: RootState) => state.draw.shapes[id]);
  const transform = `translate(${text.x}, ${text.y})`;
  const draggedId = useSelector(
    (state: RootState) => state.draw.drag && state.draw.drag.id
  );

  const cursor = draggedId === props.id ? 'grabbing' : 'grab';

  return (
    <g
      id={props.id}
      transform={transform}
      cursor={cursor}
      onMouseDown={(e) =>
        dispatch(
          startDrag({ id: props.id, clickX: e.clientX, clickY: e.clientY })
        )
      }
    >
      <text style={{ textAnchor: 'middle' }}>
        <tspan>{text.text}</tspan>
      </text>
    </g>
  );
});

export default Text;
