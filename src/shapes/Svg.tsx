import React from 'react';
import Group from './Group';
import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';
import {
  cancelSelect,
  drag,
  endDrag,
  newRectByDrag,
  resize,
  endResize,
  startNewRectByClick,
  endNewRectByClick,
  startNewRectByDrag,
  endNewRectByDrag,
} from '../reducers/shapes/shape';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../App';
import { mouseMove } from '../reducers/mouse';
import { wheel, wheelEnd, pan, startPan, endPan } from '../reducers/svg';

export interface SvgProps {
  // X, Y coords on top-left of SVG
  topLeftX: number;
  topLeftY: number;

  // X, Y coords when translating SVG
  translateX: number;
  translateY: number;

  // scale
  scale: number;
}

// throttled and debounce functions live outside component
function handleOnWheel(
  dispatch: any,
  clientX: number,
  clientY: number,
  deltaY: number,
  deltaMode: number
) {
  dispatch(
    wheel({
      clickX: clientX,
      clickY: clientY,
      scaleFactor: -deltaY * (deltaMode === 1 ? 0.05 : deltaMode ? 1 : 0.002),
    })
  );

  debouncedOnWheelEnd(dispatch);
}

const throttledOnWheel = throttle(
  (dispatch, clientX, clientY, deltaY, deltaMode) => {
    handleOnWheel(dispatch, clientX, clientY, deltaY, deltaMode);
  },
  20
);

function handleOnWheelEnd(dispatch: any) {
  dispatch(wheelEnd());
}

const debouncedOnWheelEnd = debounce(
  (dispatch) => handleOnWheelEnd(dispatch),
  200
);

const Svg: React.FC<SvgProps> = (props) => {
  const translateX = props.topLeftX + props.translateX;
  const translateY = props.topLeftY + props.translateY;
  const transform = `translate(${translateX}, ${translateY}) scale(${props.scale})`;

  const isDragging = useSelector((state: RootState) => !!state.shapes.drag);
  const isPanning = useSelector((state: RootState) => !!state.svg.pan);
  const newRectByClickState = useSelector(
    (state: RootState) => state.shapes.newRectByClick
  );
  const isNewRectByDragState = useSelector(
    (state: RootState) => !!state.shapes.newRectByDrag
  );

  const svgState = useSelector((state: RootState) => state.svg);
  const isResizing = useSelector((state: RootState) => !!state.shapes.resize);
  const dispatch = useDispatch();

  function handleMouseMove(e: React.MouseEvent) {
    dispatch(
      mouseMove({
        clickX: e.clientX,
        clickY: e.clientY,
        svgTopLeftX: svgState.topLeftX,
        svgTopLeftY: svgState.topLeftY,
        svgScale: svgState.scale,
      })
    );

    if (isNewRectByDragState) {
      dispatch(
        newRectByDrag({
          clickX: e.clientX,
          clickY: e.clientY,
          svgTopLeftX: svgState.topLeftX,
          svgTopLeftY: svgState.topLeftY,
          svgScale: svgState.scale,
        })
      );
    }

    if (isDragging) {
      dispatch(
        drag({
          clickX: e.clientX,
          clickY: e.clientY,
          scale: svgState.scale,
        })
      );
    }

    if (isPanning) {
      dispatch(pan({ clickX: e.clientX, clickY: e.clientY }));
    }

    if (isResizing) {
      dispatch(
        resize({
          clickX: e.clientX,
          clickY: e.clientY,
          svgScale: svgState.scale,
        })
      );
    }
  }

  function handleMouseDown(e: React.MouseEvent) {
    dispatch(cancelSelect());

    if (e.altKey) {
      dispatch(startNewRectByClick({ clickX: e.clientX, clickY: e.clientY }));
      dispatch(startNewRectByDrag({ clickX: e.clientX, clickY: e.clientY }));
    } else {
      dispatch(startPan({ clickX: e.clientX, clickY: e.clientY }));
    }
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (
      newRectByClickState &&
      newRectByClickState.clickX === e.clientX &&
      newRectByClickState.clickY === e.clientY
    ) {
      dispatch(
        endNewRectByClick({
          clickX: e.clientX,
          clickY: e.clientY,
          svgTopLeftX: svgState.topLeftX,
          svgTopLeftY: svgState.topLeftY,
          svgScale: svgState.scale,
          svgZoomLevel: svgState.zoomLevel,
        })
      );
    }

    if (isNewRectByDragState) {
      dispatch(endNewRectByDrag());
    }

    if (isDragging) {
      dispatch(endDrag());
    }

    if (isPanning) {
      dispatch(endPan());
    }

    if (isResizing) {
      dispatch(endResize());
    }
  }

  return (
    <svg
      id="odys-svg"
      style={{
        height: '100%',
        width: '100%',
        background: 'var(--odys-background-gray)',
      }}
      onMouseMove={(e) => handleMouseMove(e)}
      onMouseDown={(e) => handleMouseDown(e)}
      onMouseUp={(e) => handleMouseUp(e)}
      onWheel={(e) =>
        throttledOnWheel(dispatch, e.clientX, e.clientY, e.deltaY, e.deltaMode)
      }
    >
      <Group id="odys-zoomable-group" cursor="grab" transform={transform}>
        {props.children}
      </Group>
    </svg>
  );
};

export default Svg;
