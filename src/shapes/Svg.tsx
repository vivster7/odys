import React, { useEffect, useState } from 'react';
import RoundRect from './RoundRect';
import Group from './Group';

import { select, event } from 'd3-selection';
import { zoom } from 'd3-zoom';

const Svg: React.FC = () => {
  const [width, height] = [1000, 1000];

  const [zoomTransform, setZoomTransform] = useState('');

  useEffect(() => {
    const svg = select('svg');

    svg.call((selection: any) => {
      return zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([1, 10])
        .translateExtent([[-1000, -1000], [1000, 1000]])
        .on('zoom', () => setZoomTransform(event.transform))(selection);
    });
  });

  return (
    <svg
      id="odys-svg"
      style={{ height: '100%', width: '100%' }}
      viewBox="0 0 1000 1000"
    >
      <Group transform={zoomTransform}>
        <RoundRect
          text="This is a very long testing string. This is too long for a single line. WHAT TO DO!"
          x={10}
          y={20}
        ></RoundRect>
        <RoundRect text="Hello" x={0} y={120}></RoundRect>
        <RoundRect
          text="This is a very long testing string. This is too long for a single line. WHAT TO DO!"
          x={10}
          y={220}
        ></RoundRect>
      </Group>
    </svg>
  );
};

export default Svg;
