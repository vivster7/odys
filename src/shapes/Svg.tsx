import React, { useState, useContext, useRef, useLayoutEffect } from 'react';
import Group from './Group';
import { GlobalStateContext } from '../globals';

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

const Svg: React.FC<SvgProps> = props => {
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(1000);

  const svgRef = useRef<SVGSVGElement>(null);

  const transform = `translate(${props.topLeftX +
    props.translateX}, ${props.topLeftY + props.translateY}) scale(${
    props.scale
  })`;
  const { globalState, dispatch } = useContext(GlobalStateContext);

  // change viewbox to match screen size.
  useLayoutEffect(() => {
    if (svgRef && svgRef.current) {
      const { width, height } = svgRef.current.getBoundingClientRect();
      setWidth(width);
      setHeight(height);
    }
  }, []);

  function handleMouseMove(e: React.MouseEvent) {
    if (globalState.drag) {
      dispatch({
        type: 'ODYS_DRAG_ACTION',
        clickX: e.clientX,
        clickY: e.clientY
      });
    }

    if (globalState.pan) {
      dispatch({
        type: 'ODYS_PAN_ACTION',
        clickX: e.clientX,
        clickY: e.clientY
      });
    }

    if (globalState.resizeShape) {
      dispatch({
        type: 'ODYS_RESIZE_ACTION',
        clickX: e.clientX,
        clickY: e.clientY
      });
    }
  }

  function handleMouseDown(e: React.MouseEvent) {
    startPan(e);
    startNewRectByClick(e);

    function startPan(e: React.MouseEvent) {
      dispatch({
        type: 'ODYS_START_PAN_ACTION',
        clickX: e.clientX,
        clickY: e.clientY
      });
    }

    function startNewRectByClick(e: React.MouseEvent) {
      dispatch({
        type: 'ODYS_START_NEW_RECT_BY_CLICK_ACTION',
        clickX: e.clientX,
        clickY: e.clientY
      });
    }
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (
      globalState.newRectByClick &&
      globalState.newRectByClick.clickX === e.clientX &&
      globalState.newRectByClick.clickY === e.clientY
    ) {
      return dispatch({
        type: 'ODYS_END_NEW_RECT_BY_CLICK_ACTION',
        clickX: e.clientX,
        clickY: e.clientY
      });
    }

    if (globalState.drag) {
      return dispatch({
        type: 'ODYS_END_DRAG_ACTION'
      });
    }

    if (globalState.pan) {
      return dispatch({
        type: 'ODYS_END_PAN_ACTION'
      });
    }

    if (globalState.resizeShape) {
      return dispatch({
        type: 'ODYS_END_RESIZE_ACTION'
      });
    }
  }

  function handleOnWheel(e: React.WheelEvent) {
    dispatch({
      type: 'ODYS_WHEEL_ACTION',
      clickX: e.clientX,
      clickY: e.clientY,
      scaleFactor:
        -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002)
    });
  }

  return (
    <svg
      id="odys-svg"
      style={{
        height: '100%',
        width: '100%',
        background: 'var(--odys-background-gray)'
      }}
      viewBox={`0 0 ${width} ${height}`}
      ref={svgRef}
      onMouseMove={e => handleMouseMove(e)}
      onMouseDown={e => handleMouseDown(e)}
      onMouseUp={e => handleMouseUp(e)}
      onWheel={e => handleOnWheel(e)}
    >
      <Group id="odys-zoomable-group" cursor="grab" transform={transform}>
        {props.children}
      </Group>
    </svg>
  );
};

export default Svg;
