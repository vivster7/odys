import React, {
  useEffect,
  useState,
  useContext,
  useRef,
  useLayoutEffect
} from 'react';
import Group from './Group';

import { select, event } from 'd3-selection';
import { zoom } from 'd3-zoom';
import { GlobalStateContext } from '../globals';
import { v4 } from 'uuid';

const id = () => `id-${v4()}`;

const Svg: React.FC = props => {
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(1000);

  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  const [zoomTransform, setZoomTransform] = useState('');
  const { globalState, dispatch } = useContext(GlobalStateContext);

  useEffect(() => {
    const svg = select('svg');

    svg.call((selection: any) => {
      return (
        zoom()
          .extent([[0, 0], [width, height]])
          // .scaleExtent([1, 100])
          // .translateExtent([[0, 0], [width, height]])
          .on('zoom', () => {
            // console.log(event.transform);
            const { k, x, y } = event.transform;
            setScale(k);
            setTranslateX(x);
            setTranslateY(y);
            return setZoomTransform(event.transform);
          })(selection)
      );
    });
  });

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

  function handleClick(e: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    e.stopPropagation();
    const x = (e.clientX - translateX) / scale;
    const y = (e.clientY - translateY) / scale;
    addRect(x, y);
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
      onClick={e => handleClick(e)}
      ref={svgRef}
      preserveAspectRatio="none"
    >
      <Group id="odys-zoomable-group" cursor="grab" transform={zoomTransform}>
        {props.children}
      </Group>
    </svg>
  );
};

export default Svg;
