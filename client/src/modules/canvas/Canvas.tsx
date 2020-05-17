import React, { useState, Dispatch, useEffect } from 'react';
import debounce from 'lodash.debounce';
import {
  cancelSelect,
  drag,
  resize,
  startDragSelection,
  resizeDragSelection,
  endDragSelection,
  startNewRect,
  endNewRectByDrag,
} from '../draw/draw.reducer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../App';
import { wheelEnd, endPan, cleanCanvas } from './canvas.reducer';
import DrawContainer from '../draw/DrawContainer';
import { endNewRectByClick } from '../draw/shape/newRect.reducer';
import MultiSelect from '../draw/mixins/multiSelect/MultiSelect';
import { zoomLeveltoScaleMap } from './zoom/zoom.reducer';
import { endDrag } from 'modules/draw/shape/mixins/drag/drag.reducer';
import { endResize } from 'modules/draw/shape/mixins/resize/resize.reducer';
import * as uuid from 'uuid';

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

const Canvas: React.FC = () => {
  const dispatch = useDispatch();

  const boardId = useSelector((state: RootState) => state.board.id);
  const dragState = useSelector((state: RootState) => state.draw.drag);
  const isMultiSelecting = useSelector(
    (state: RootState) => !!state.draw.multiSelect?.selectionRect
  );

  const newRect = useSelector((state: RootState) => state.draw.newRect);

  const canvasState = useSelector((state: RootState) => state.canvas);
  const resizingId = useSelector(
    (state: RootState) => state.draw.resize && state.draw.resize.id
  );

  // using local variable to make scale / pan fast!
  const [topLeftX, setTopLeftX] = useState(canvasState.topLeftX);
  const [topLeftY, setTopLeftY] = useState(canvasState.topLeftY);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [scale, setScale] = useState(canvasState.scale);
  const [zoomLevel, setZoomLevel] = useState(canvasState.zoomLevel);

  const [pan, setPan] = useState<PanState | null>(null);

  const [selectMode, setSelectMode] = useState(false);
  const cursor = selectMode ? 'crosshair' : 'auto';

  const transform = `translate(${topLeftX + translateX}, ${
    topLeftY + translateY
  }) scale(${scale})`;

  if (canvasState.dirty) {
    setTopLeftX(canvasState.topLeftX);
    setTopLeftY(canvasState.topLeftY);
    setScale(canvasState.scale);
    setZoomLevel(canvasState.zoomLevel);
    dispatch(cleanCanvas());
  }

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

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, {
      passive: false,
      capture: true,
    });
    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
    };
  });

  function handleMouseMove(e: React.MouseEvent) {
    if (newRect) {
      dispatch(
        endNewRectByDrag({
          id: uuid.v4(),
          clickX: e.clientX,
          clickY: e.clientY,
          canvasTopLeftX: canvasState.topLeftX,
          canvasTopLeftY: canvasState.topLeftY,
          canvasScale: canvasState.scale,
          canvasZoomLevel: canvasState.zoomLevel,
          boardId: boardId,
        })
      );
    }

    if (dragState) {
      dispatch(
        drag({
          clickX: e.clientX,
          clickY: e.clientY,
          scale: canvasState.scale,
        })
      );
    }

    if (isMultiSelecting) {
      dispatch(
        resizeDragSelection({
          clickX: e.clientX,
          clickY: e.clientY,
          canvasTopLeftX: canvasState.topLeftX,
          canvasTopLeftY: canvasState.topLeftY,
          canvasScale: canvasState.scale,
        })
      );
    }

    if (pan !== null) {
      setTranslateX(e.clientX - pan.startX);
      setTranslateY(e.clientY - pan.startY);
    }

    if (resizingId) {
      dispatch(
        resize({
          clickX: e.clientX,
          clickY: e.clientY,
          canvasScale: canvasState.scale,
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
          canvasTopLeftX: topLeftX,
          canvasTopLeftY: topLeftY,
          canvasScale: scale,
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
          id: uuid.v4(),
          clickX: e.clientX,
          clickY: e.clientY,
          canvasTopLeftX: canvasState.topLeftX,
          canvasTopLeftY: canvasState.topLeftY,
          canvasScale: canvasState.scale,
          canvasZoomLevel: canvasState.zoomLevel,
          boardId: boardId,
        })
      );
    }

    if (dragState) {
      dispatch(
        endDrag({
          id: dragState.id,
          startX: dragState.clickX,
          startY: dragState.clickY,
          endX: e.clientX,
          endY: e.clientY,
        })
      );
    }
    if (isMultiSelecting) {
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

    if (resizingId) {
      dispatch(endResize(resizingId));
    }
  }

  function handleWheel(e: WheelEvent) {
    // stops native pinch-to-zoom
    e.preventDefault();

    // browser sends ctrl key for pinch-to-zoom
    const isPinchToZoom = e.ctrlKey;

    const invertX = (e.clientX - topLeftX) / scale;
    const invertY = (e.clientY - topLeftY) / scale;

    let scaleFactor;
    if (e.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
      scaleFactor = 0.002 * -e.deltaY;
    } else if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) {
      scaleFactor = 0.05 * -e.deltaY;
    } else {
      scaleFactor = 1 * -e.deltaY;
    }

    if (isPinchToZoom) {
      scaleFactor *= 7;
    }

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
      id="odys-canvas"
      style={{
        height: '100%',
        width: '100%',
        background: 'var(--odys-background-gray)',
      }}
      onMouseMove={(e) => handleMouseMove(e)}
      onMouseDown={(e) => handleMouseDown(e)}
      onMouseUp={(e) => handleMouseUp(e)}
      // onWheel={(e) => handleWheel(e)}
      cursor={cursor}
    >
      <g id="odys-zoomable-group" transform={transform}>
        <DrawContainer></DrawContainer>
        <MultiSelect></MultiSelect>
      </g>
    </svg>
  );
};

export default Canvas;