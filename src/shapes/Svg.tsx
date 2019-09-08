import React, { useEffect, useState } from 'react';
import Group from './Group';

import { select, event } from 'd3-selection';
import { zoom } from 'd3-zoom';

const Svg: React.FC = props => {
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
      viewBox={`0 0 ${width} ${height}`}
    >
      <Group id="odys-zoomable-group" cursor="grab" transform={zoomTransform}>
        {props.children}
      </Group>
    </svg>
  );
};

export default Svg;
