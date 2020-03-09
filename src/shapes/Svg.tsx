import React, { useState, useContext, useRef, useLayoutEffect } from 'react';
import Group from './Group';
import { GlobalStateContext } from '../globals';
import { v4 } from 'uuid';

const id = () => `id-${v4()}`;
export interface SvgProps extends React.SVGProps<SVGSVGElement> {
  // X, Y coords on top-left of SVG
  topLeftX: number;
  topLeftY: number;

  // X, Y coords when translating SVG
  translateX: number;
  translateY: number;
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
    dispatch({
      type: 'ODYS_MOUSE_MOVE',
      clickX: e.clientX,
      clickY: e.clientY
    });
  }

  function handleMouseDown(e: React.MouseEvent) {
    dispatch({
      type: 'ODYS_MOUSE_DOWN',
      target: e.target,
      clickX: e.clientX,
      clickY: e.clientY
    });
  }

  function handleMouseUp(e: React.MouseEvent) {
    dispatch({
      type: 'ODYS_MOUSE_UP',
      target: e.target,
      clickX: e.clientX,
      clickY: e.clientY
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
    >
      <Group id="odys-zoomable-group" cursor="grab" transform={transform}>
        {props.children}
      </Group>
    </svg>
  );
};

export default Svg;
