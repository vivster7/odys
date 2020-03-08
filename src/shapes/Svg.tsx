import React, { useState, useContext, useRef, useLayoutEffect } from 'react';
import Group from './Group';
import { GlobalStateContext } from '../globals';
import { v4 } from 'uuid';

const id = () => `id-${v4()}`;
export interface SvgProps extends React.SVGProps<SVGSVGElement> {}

const Svg: React.FC<SvgProps> = props => {
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(1000);

  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  const svgRef = useRef<SVGSVGElement>(null);

  const [zoomTransform, setZoomTransform] = useState('');
  const { globalState, dispatch } = useContext(GlobalStateContext);

  // change viewbox to match screen size.
  useLayoutEffect(() => {
    if (svgRef && svgRef.current) {
      const { width, height } = svgRef.current.getBoundingClientRect();
      setWidth(width);
      setHeight(height);
    }
  }, []);

  function addRect(x: number, y: number) {
    dispatch({
      type: 'ODYS_ADD_SHAPE',
      shape: { type: 'rect', id: id(), text: 'A', x: x, y: y }
    });
  }

  function handleClick(e: React.MouseEvent) {
    console.log(e);
    e.stopPropagation();
    const x = (e.clientX - translateX) / scale;
    const y = (e.clientY - translateY) / scale;
    addRect(x, y);
  }

  function handleMouseMove(e: React.MouseEvent) {
    dispatch({
      type: 'ODYS_MOUSE_MOVE',
      clickX: e.clientX,
      clickY: e.clientY
    });
  }

  function handleMouseUp(e: React.MouseEvent) {
    dispatch({
      type: 'ODYS_MOUSE_UP'
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
      onClick={e => handleClick(e)}
      onMouseMove={e => handleMouseMove(e)}
      onMouseUp={e => handleMouseUp(e)}
    >
      <Group id="odys-zoomable-group" cursor="grab" transform={zoomTransform}>
        {props.children}
      </Group>
    </svg>
  );
};

export default Svg;
