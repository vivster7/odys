import { useEffect, useState, useContext } from 'react';
import { select, event, clientPoint } from 'd3-selection';
import { drag } from 'd3-drag';
import { ShapesContext } from '../App';

/**
 * Makes an SVG object draggable.
 *
 * The `this` object is correctly injected by D3.
 *
 * @param id ID of object to drag. Must be unique
 * @param initTransform used to set initial transform value (e.g starting (x,y) pos)
 */
export default function useDraggable(id: string, initTransform: string) {
  // offsets of the cursor from the top-left of the container
  let offsetX: number;
  let offsetY: number;

  const [transform, setTransform] = useState(initTransform);
  const [cursor, setCursor] = useState('grab');

  const { shapes, setShapes } = useContext(ShapesContext);

  function raise(id: string) {
    const idx = shapes.findIndex(d => d.id === id);
    const item = shapes[idx];

    setShapes([...shapes.slice(0, idx), ...shapes.slice(idx + 1), ...[item]]);
  }

  function dragstarted(this: any) {
    raise(id);
    setCursor('grabbing');

    let [x, y] = clientPoint(this, event.sourceEvent);
    offsetX = x;
    offsetY = y;
  }

  function dragged() {
    setTransform(`translate(${event.x - offsetX}, ${event.y - offsetY})`);
  }

  function dragended() {
    setCursor('grab');
  }

  useEffect(() => {
    const group = select(`#${id}`);

    group.call((selection: any) => {
      return drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)(selection);
    });
  });

  return [transform, cursor];
}
