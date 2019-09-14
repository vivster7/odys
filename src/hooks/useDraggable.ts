import { useEffect, useState, useContext } from 'react';
import { select, event, clientPoint } from 'd3-selection';
import { drag } from 'd3-drag';
import { GlobalStateContext } from '../globals';

/**
 * Makes an SVG object draggable.
 * This hook depends on the `GlobalStateContext`
 *
 * The `this` object is correctly injected by D3.
 *
 * @param id ID of object to drag. Must be unique
 * @param initTransform used to set initial transform value (e.g starting (x,y) pos)
 */
export default function useDraggable(id: string, initTransform: string) {
  const [transform, setTransform] = useState(initTransform);
  const [cursor, setCursor] = useState('grab');

  const { dispatch } = useContext(GlobalStateContext);

  useEffect(() => {
    // offsets of the cursor from the top-left of the container
    let offsetX: number;
    let offsetY: number;

    // Raise to top of SVG canvas (by appending as last sibling)
    function raise(id: string) {
      dispatch({ type: 'ODYS_RAISE_SHAPE', id: id });
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

    // TODO(vivek): this only needs to be registered once.
    const group = select(`#${id}`);

    group.call((selection: any) => {
      return drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)(selection);
    });
  }, [id, dispatch]);

  return [transform, cursor];
}
