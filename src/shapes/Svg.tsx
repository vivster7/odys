import React from 'react';
import Group from './Group';
import throttle from 'lodash.throttle';
import debounce from 'lodash.debounce';
import {
  cancelSelect,
  drag,
  endDrag,
  startPan,
  pan,
  endPan,
  newRectByDrag,
  resize,
  endResize,
  startNewRectByClick,
  endNewRectByClick,
  startNewRectByDrag,
  endNewRectByDrag,
  wheel,
  wheelEnd,
  ShapeState,
} from '../reducers/shapes/shape';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../App';
import { mouseMove } from '../reducers/mouse';

export interface SvgProps extends React.SVGProps<SVGSVGElement> {
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

  const dragState = useSelector((state: RootState) => state.shapes.drag);
  const panState = useSelector((state: RootState) => state.shapes.pan);
  const newRectByClickState = useSelector(
    (state: RootState) => state.shapes.newRectByClick
  );
  const newRectByDragState = useSelector(
    (state: RootState) => state.shapes.newRectByDrag
  );
  const svgTopLeftX = useSelector(
    (state: RootState) => state.shapes.svg.topLeftX
  );
  const svgTopLeftY = useSelector(
    (state: RootState) => state.shapes.svg.topLeftY
  );
  const svgScale = useSelector((state: RootState) => state.shapes.svg.scale);
  const resizeState = useSelector((state: RootState) => state.shapes.resize);
  const dispatch = useDispatch();

  function handleMouseMove(e: React.MouseEvent) {
    dispatch(
      mouseMove({
        clickX: e.clientX,
        clickY: e.clientY,
        svgTopLeftX,
        svgTopLeftY,
        svgScale,
      })
    );

    if (newRectByDragState) {
      dispatch(newRectByDrag({ clickX: e.clientX, clickY: e.clientY }));
    }

    if (dragState) {
      dispatch(
        drag({
          clickX: e.clientX,
          clickY: e.clientY,
          scale: svgScale,
        })
      );
    }

    if (panState) {
      dispatch(pan({ clickX: e.clientX, clickY: e.clientY }));
    }

    if (resizeState) {
      dispatch(resize({ clickX: e.clientX, clickY: e.clientY }));
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
      dispatch(endNewRectByClick({ clickX: e.clientX, clickY: e.clientY }));
    }

    if (newRectByDragState) {
      dispatch(endNewRectByDrag());
    }

    if (dragState) {
      dispatch(endDrag());
    }

    if (panState) {
      dispatch(endPan());
    }

    if (resizeState) {
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
