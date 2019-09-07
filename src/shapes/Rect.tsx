import React, { useEffect } from 'react';
import Group from './Group';
import Text from './Text';
import { select, event, mouse } from 'd3-selection';
import { drag } from 'd3-drag';
import { v4 } from 'uuid';

interface RectProps extends React.SVGProps<SVGRectElement> {
  x: number;
  y: number;
  text: string;
}

const Rect: React.FC<RectProps> = (props: RectProps) => {
  const id = 'id-' + v4();
  const [x, y] = [props.x, props.y];
  const [width, height] = [200, 100];
  const [textX, textY] = [width / 2, height / 2];

  function dragstarted(this: any) {
    select(this).raise();
    select(this).attr('cursor', 'grabbing');
    let [offsetX, offsetY] = mouse(this);
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  function dragged(this: any) {
    select(this).attr(
      'transform',
      `translate(${event.x - this.offsetX}, ${event.y - this.offsetY})`
    );
  }

  function dragended(this: any) {
    delete this.offsetX;
    delete this.offsetY;
    select(this).attr('cursor', 'grab');
  }

  useEffect(() => {
    const rect = select(`#${id}`);

    rect.call((selection: any) => {
      return drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)(selection);
    });
  });

  return (
    <Group id={id} transform={`translate(${x} ${y})`}>
      <rect
        width={width}
        height={height}
        rx="10"
        ry="10"
        fill="white"
        stroke="black"
      ></rect>
      <Text x={textX} y={textY} text={props.text}></Text>
    </Group>
  );
};

export default Rect;
