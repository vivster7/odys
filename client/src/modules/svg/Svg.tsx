import React, { useState, Dispatch, useEffect } from 'react';
import debounce from 'lodash.debounce';
import {
  cancelSelect,
  drag,
  resize,
  endResize,
  startDragSelection,
  resizeDragSelection,
  endDragSelection,
  startNewRect,
  endNewRectByDrag,
} from '../draw/draw.reducer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../App';
import { wheelEnd, endPan, cleanSvg } from './svg.reducer';
import DrawContainer from '../draw/DrawContainer';
import { endNewRectByClick } from '../draw/shape/newRect.reducer';
import GroupSelect from '../draw/mixins/groupSelect/GroupSelect';
import { zoomLeveltoScaleMap } from './zoom/zoom.reducer';
import { endDrag } from 'modules/draw/shape/mixins/drag/drag.reducer';
import boardReducer from 'modules/board/board.reducer';

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
  150
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
}

interface PanState {
  startX: number;
  startY: number;
}

const Svg: React.FC = () => {
  const dispatch = useDispatch();

  const boardId = useSelector((state: RootState) => state.board.id);
  const isDragging = useSelector((state: RootState) => !!state.draw.drag);
  const isGroupSelecting = useSelector(
    (state: RootState) => !!state.draw.groupSelect?.selectionRect
  );

  const newRect = useSelector((state: RootState) => state.draw.newRect);

  const svgState = useSelector((state: RootState) => state.svg);
  const isResizing = useSelector((state: RootState) => !!state.draw.resize);

  // using local variable to make scale / pan fast!
  const [topLeftX, setTopLeftX] = useState(svgState.topLeftX);
  const [topLeftY, setTopLeftY] = useState(svgState.topLeftY);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [scale, setScale] = useState(svgState.scale);
  const [zoomLevel, setZoomLevel] = useState(svgState.zoomLevel);

  const [pan, setPan] = useState<PanState | null>(null);

  const [selectMode, setSelectMode] = useState(false);
  const cursor = selectMode ? 'crosshair' : 'auto';

  function onKeyDownHandler(e: KeyboardEvent) {
    if (e.key === 'Shift') {
      setSelectMode(true);
    }
  }

  function onKeyUpHandler(e: KeyboardEvent) {
    if (e.key === 'Shift') {
      setSelectMode(false);
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', onKeyDownHandler);
    window.addEventListener('keyup', onKeyUpHandler);
    return () => {
      window.removeEventListener('keydown', onKeyDownHandler);
      window.addEventListener('keyup', onKeyUpHandler);
    };
  });

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
    if (newRect) {
      dispatch(
        endNewRectByDrag({
          clickX: e.clientX,
          clickY: e.clientY,
          svgTopLeftX: svgState.topLeftX,
          svgTopLeftY: svgState.topLeftY,
          svgScale: svgState.scale,
          svgZoomLevel: svgState.zoomLevel,
          boardId: boardId,
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

    if (isGroupSelecting) {
      dispatch(
        resizeDragSelection({
          clickX: e.clientX,
          clickY: e.clientY,
          svgTopLeftX: svgState.topLeftX,
          svgTopLeftY: svgState.topLeftY,
          svgScale: svgState.scale,
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
      dispatch(startNewRect({ clickX: e.clientX, clickY: e.clientY }));
    } else if (selectMode) {
      dispatch(
        startDragSelection({
          x: e.clientX,
          y: e.clientY,
          svgTopLeftX: topLeftX,
          svgTopLeftY: topLeftY,
          svgScale: scale,
        })
      );
    } else {
      setPan({ startX: e.clientX, startY: e.clientY });
    }
  }

  function handleMouseUp(e: React.MouseEvent) {
    if (
      newRect &&
      newRect.clickX === e.clientX &&
      newRect.clickY === e.clientY
    ) {
      dispatch(
        endNewRectByClick({
          clickX: e.clientX,
          clickY: e.clientY,
        })
      );
    }

    if (isDragging) {
      dispatch(endDrag());
    }
    if (isGroupSelecting) {
      dispatch(endDragSelection());
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
      cursor={cursor}
    >
      <g id="odys-zoomable-group" transform={transform}>
        <DrawContainer></DrawContainer>
        <GroupSelect></GroupSelect>
      </g>
    </svg>
  );
};

export default Svg;
