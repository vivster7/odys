import React, { useState, Dispatch } from 'react';
import debounce from 'lodash.debounce';
import {
  cancelSelect,
  drag,
  endDrag,
  newRectByDrag,
  resize,
  endResize,
  startNewRectByClick,
  startNewRectByDrag,
  endNewRectByDrag,
} from '../reducers/shapes/shape';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../App';
import {
  wheelEnd,
  endPan,
  zoomLeveltoScaleMap,
  cleanSvg,
} from '../reducers/svg';
import ShapesContainer from './ShapesContainer';
import { endNewRectByClick } from '../reducers/shapes/newRect';

const debouncedOnWheelEnd = debounce(
  (
    dispatch: Dispatch<any>,
    topLeftX: number,
    topLeftY: number,
    scale: number,
    zoomLevel: number
  ) => {
    dispatch(wheelEnd({ topLeftX, topLeftY, scale, zoomLevel }));
  },
  200
);

// force `n` to be between min and max (inclusive)
function bound(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

// find nearest zoomLevel for a scale `k`. (round down)
function zoomLevelBucket(existingZoomLevel: number, k: number): number {
  const modifiedMap: { [key: number]: number } = {
    ...zoomLeveltoScaleMap,
    0: -Infinity,
    10: Infinity,
  };

  const [lower, upper] = [
    modifiedMap[existingZoomLevel - 1],
    modifiedMap[existingZoomLevel + 1],
  ];
  if (k > lower && k < upper) {
    return existingZoomLevel;
  }

  if (k <= lower) {
    for (let n = 1; n < existingZoomLevel; n++) {
      if (k <= modifiedMap[n]) {
        return n;
      }
    }
  } else if (k >= upper) {
    for (let n = 9; n > existingZoomLevel; n--) {
      if (k >= modifiedMap[n]) {
        return n;
      }
    }
  }
  throw new Error(`Couldn't figure out a zoomLevel for scale ${k}`);
  // const entries = Object.entries(zoomLeveltoScaleMap);
  // for (let [i, j] = [0, 1]; j < entries.length; [i, j] = [i + 1, j + 1]) {
  //   let [zoomLevel1, scale1] = entries[i];
  //   let scale2 = entries[j][1];

  //   if (scale1 <= k && k < scale2) {
  //     return parseInt(zoomLevel1);
  //   }
  // }

  // return Math.max(...Object.keys(zoomLeveltoScaleMap).map((s) => parseInt(s)));
}

interface PanState {
  startX: number;
  startY: number;
}

const Svg: React.FC = () => {
  const dispatch = useDispatch();
  const isDragging = useSelector((state: RootState) => !!state.shapes.drag);
  const newRectByClickState = useSelector(
    (state: RootState) => state.shapes.newRectByClick
  );
  const isNewRectByDragState = useSelector(
    (state: RootState) => !!state.shapes.newRectByDrag
  );

  const svgState = useSelector((state: RootState) => state.svg);
  const isResizing = useSelector((state: RootState) => !!state.shapes.resize);

  // using local variable to make scale / pan fast!
  const [topLeftX, setTopLeftX] = useState(svgState.topLeftX);
  const [topLeftY, setTopLeftY] = useState(svgState.topLeftY);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [scale, setScale] = useState(svgState.scale);
  const [zoomLevel, setZoomLevel] = useState(svgState.zoomLevel);

  const [pan, setPan] = useState<PanState | null>(null);

  if (svgState.dirty) {
    setTopLeftX(svgState.topLeftX);
    setTopLeftY(svgState.topLeftY);
    setScale(svgState.scale);
    setZoomLevel(svgState.zoomLevel);
    dispatch(cleanSvg());
  }

  const transform = `translate(${topLeftX + translateX}, ${
    topLeftY + translateY
  }) scale(${scale})`;

  function handleMouseMove(e: React.MouseEvent) {
    if (isNewRectByDragState) {
      dispatch(
        newRectByDrag({
          clickX: e.clientX,
          clickY: e.clientY,
          svgTopLeftX: svgState.topLeftX,
          svgTopLeftY: svgState.topLeftY,
          svgScale: svgState.scale,
          svgZoomLevel: svgState.zoomLevel,
        })
      );
    }

    if (isDragging) {
      dispatch(
        drag({
          clickX: e.clientX,
          clickY: e.clientY,
          scale: svgState.scale,
        })
      );
    }

    if (pan !== null) {
      setTranslateX(e.clientX - pan.startX);
      setTranslateY(e.clientY - pan.startY);
    }

    if (isResizing) {
      dispatch(
        resize({
          clickX: e.clientX,
          clickY: e.clientY,
          svgScale: svgState.scale,
        })
      );
    }
  }

  function handleMouseDown(e: React.MouseEvent) {
    dispatch(cancelSelect());

    if (e.altKey) {
      dispatch(startNewRectByClick({ clickX: e.clientX, clickY: e.clientY }));
      dispatch(startNewRectByDrag({ clickX: e.clientX, clickY: e.clientY }));
    } else {
      setPan({ startX: e.clientX, startY: e.clientY });
    }
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (
      newRectByClickState &&
      newRectByClickState.clickX === e.clientX &&
      newRectByClickState.clickY === e.clientY
    ) {
      dispatch(
        endNewRectByClick({
          clickX: e.clientX,
          clickY: e.clientY,
        })
      );
    }

    if (isNewRectByDragState) {
      dispatch(endNewRectByDrag());
    }

    if (isDragging) {
      dispatch(endDrag());
    }

    if (pan !== null) {
      setPan(null);
      setTopLeftX(topLeftX + translateX);
      setTopLeftY(topLeftY + translateY);
      setTranslateX(0);
      setTranslateY(0);
      dispatch(endPan({ topLeftX, topLeftY }));
    }

    if (isResizing) {
      dispatch(endResize());
    }
  }

  function handleWheel(e: React.WheelEvent) {
    const invertX = (e.clientX - topLeftX) / scale;
    const invertY = (e.clientY - topLeftY) / scale;
    const scaleFactor =
      -e.deltaY * (e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002);

    const updatedScale = bound(
      scale * Math.pow(2, scaleFactor),
      1 * 8 ** -4,
      1 * 8 ** 4
    );
    const updatedTopLeftX = e.clientX - invertX * updatedScale;
    const updatedTopLeftY = e.clientY - invertY * updatedScale;

    setScale(updatedScale);
    setTopLeftX(updatedTopLeftX);
    setTopLeftY(updatedTopLeftY);
    setZoomLevel(zoomLevelBucket(zoomLevel, updatedScale));
    debouncedOnWheelEnd(
      dispatch,
      updatedTopLeftX,
      updatedTopLeftY,
      updatedScale,
      zoomLevel
    );
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
      onWheel={(e) => handleWheel(e)}
    >
      <g id="odys-zoomable-group" cursor="grab" transform={transform}>
        <ShapesContainer></ShapesContainer>
      </g>
    </svg>
  );
};

export default Svg;
