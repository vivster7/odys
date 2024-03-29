import React, { useState, Dispatch, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';
import {
  cancelSelect,
  drag,
  resize,
  startDragSelection,
  resizeDragSelection,
  endDragSelection,
  startNewRect,
  updateDrawings,
} from '../draw/draw.reducer';
import { useDispatch } from 'react-redux';
import { useSelector } from 'global/redux';
import { wheelEnd, endPan, cleanCanvas, setCursorOver } from './canvas.reducer';
import DrawContainer from '../draw/DrawContainer';
import { endNewRectByClick } from '../draw/shape/newRect.reducer';
import { newShape } from 'modules/draw/shape/shape.reducer';
import MultiSelect from '../draw/mixins/multiSelect/MultiSelect';
import {
  zoomLeveltoScaleMap,
  MIN_ZOOM_LEVEL,
  MAX_ZOOM_LEVEL,
} from './zoom/zoom.reducer';
import { endDrag } from 'modules/draw/shape/mixins/drag/drag.reducer';
import { endResize } from 'modules/draw/shape/mixins/resize/resize.reducer';
import * as uuid from 'uuid';
import { COLORS } from 'global/colors';
import Cursors from './cursor/Cursors';
import { cursorWithinEpsilon } from './cursor/cursor';
import Ghosts from './ghosts/Ghosts';
import PlayerSelectBoxes from './selectbox/PlayerSelectBoxes';
import { SHAPE_WIDTH, SHAPE_HEIGHT } from 'modules/draw/shape/type/BaseShape';
import HiddenTextInput from 'modules/draw/mixins/editText/HiddenTextInput';

export const debouncedOnWheelEnd = debounce(
  (
    dispatch: Dispatch<any>,
    clientX: number,
    clientY: number,
    topLeftX: number,
    topLeftY: number,
    scale: number,
    zoomLevel: number
  ) => {
    dispatch(
      wheelEnd({ clientX, clientY, topLeftX, topLeftY, scale, zoomLevel })
    );
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
  prevX: number;
  prevY: number;
}

const Canvas: React.FC = () => {
  const dispatch = useDispatch();

  const boardId = useSelector((s) => s.board.id);
  const dragState = useSelector((s) => s.draw.drag);
  const isMultiSelecting = useSelector(
    (s) => !!s.draw.multiSelect?.selectionRect
  );

  const newRect = useSelector((s) => s.draw.newRect);

  const canvasState = useSelector((s) => s.canvas);
  const resizingId = useSelector((s) => s.draw.resize && s.draw.resize.id);

  const isShiftPressed = useSelector((s) => s.keyboard.shiftKey);
  const isCmdPressed = useSelector((s) => s.keyboard.cmdKey);
  const isSpacePressed = useSelector((s) => s.keyboard.spaceKey);

  const selectedShapeId = useSelector((s) => s.draw.select?.id);
  const shouldIgnorePointerOver = useSelector(
    (s) => !!s.draw.drag || !!s.draw.resize
  );

  const selectMode = isShiftPressed;
  const insertMode = isCmdPressed;
  const panMode = isSpacePressed;

  // using local variable to make scale / pan fast!
  const [topLeftX, setTopLeftX] = useState(canvasState.topLeftX);
  const [topLeftY, setTopLeftY] = useState(canvasState.topLeftY);
  const [scale, setScale] = useState(canvasState.scale);
  const [zoomLevel, setZoomLevel] = useState(canvasState.zoomLevel);

  const [pan, setPan] = useState<PanState | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const cursor = (() => {
    if (insertMode) return 'pointer';
    if (selectMode) return 'crosshair';
    if (pan) return 'grabbing';
    if (panMode) return 'grab';
    return 'auto';
  })();

  const transform = `translate(${topLeftX}, ${topLeftY}) scale(${scale})`;

  if (canvasState.dirty) {
    setTopLeftX(canvasState.topLeftX);
    setTopLeftY(canvasState.topLeftY);
    setScale(canvasState.scale);
    setZoomLevel(canvasState.zoomLevel);
    dispatch(cleanCanvas());
  }

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, {
      passive: false,
      capture: true,
    });
    return () => {
      window.removeEventListener('wheel', handleWheel, { capture: true });
    };
  });

  function setPointerCaptureSVG(pointerId: number): void {
    const el = svgRef.current;
    if (!el) return;
    if (el.hasPointerCapture(pointerId)) return;
    el.setPointerCapture(pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    e.preventDefault();

    if (dragState) {
      setPointerCaptureSVG(e.pointerId);
      dispatch(
        drag({
          clickX: e.clientX,
          clickY: e.clientY,
          scale: canvasState.scale,
        })
      );
    }

    if (isMultiSelecting) {
      setPointerCaptureSVG(e.pointerId);
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
      setPointerCaptureSVG(e.pointerId);
      const deltaX = e.clientX - pan.prevX;
      const deltaY = e.clientY - pan.prevY;

      setPan({ prevX: e.clientX, prevY: e.clientY });
      setTopLeftX(topLeftX + deltaX);
      setTopLeftY(topLeftY + deltaY);
    }

    if (resizingId) {
      setPointerCaptureSVG(e.pointerId);
      dispatch(
        resize({
          clickX: e.clientX,
          clickY: e.clientY,
          canvasTopLeftX: canvasState.topLeftX,
          canvasTopLeftY: canvasState.topLeftY,
          canvasScale: canvasState.scale,
        })
      );
    }
  }

  function handlePointerDown(e: React.PointerEvent) {
    e.preventDefault();
    dispatch(cancelSelect());

    const isMiddleMouseButtonPressed = e.button === 1;

    if (e.metaKey) {
      dispatch(
        startNewRect({ clickX: e.clientX, clickY: e.clientY, selectedShapeId })
      );
    } else if (panMode || isMiddleMouseButtonPressed) {
      setPan({ prevX: e.clientX, prevY: e.clientY });
    } else {
      dispatch(
        startDragSelection({
          x: e.clientX,
          y: e.clientY,
          canvasTopLeftX: topLeftX,
          canvasTopLeftY: topLeftY,
          canvasScale: scale,
        })
      );
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    e.preventDefault();
    if (
      newRect &&
      cursorWithinEpsilon(
        newRect.clickX,
        newRect.clickY,
        e.clientX,
        e.clientY,
        canvasState.scale
      )
    ) {
      const newRectArgs = {
        id: uuid.v4(),
        clickX: e.clientX,
        clickY: e.clientY,
        canvasTopLeftX: canvasState.topLeftX,
        canvasTopLeftY: canvasState.topLeftY,
        canvasScale: canvasState.scale,
        canvasZoomLevel: canvasState.zoomLevel,
        boardId: boardId,
        arrowId: uuid.v4(),
        selectedShapeId: newRect.selectedShapeId,
      };
      dispatch(endNewRectByClick(newRectArgs));
    }

    if (dragState) {
      dispatch(
        endDrag({
          ids: dragState.encompassedIds.concat([dragState.id]),
          translateX: (e.clientX - dragState.startX) / canvasState.scale,
          translateY: (e.clientY - dragState.startY) / canvasState.scale,
        })
      );
    }

    if (isMultiSelecting) {
      dispatch(endDragSelection());
    }

    if (pan !== null) {
      setPan(null);
      dispatch(endPan({ topLeftX, topLeftY }));
    }

    if (resizingId) {
      dispatch(endResize({ id: resizingId }));
    }
  }

  function handlePointerLeave(e: React.PointerEvent) {
    handlePointerUp(e);
  }

  function handlePointerOver(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    dispatch(setCursorOver({ type: 'background' }));
  }

  function handleWheel(e: WheelEvent) {
    // stops native pinch-to-zoom
    e.preventDefault();

    // browser sends ctrl key for pinch-to-zoom
    const isPinchToZoom = e.ctrlKey;

    function zoom() {
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
        zoomLeveltoScaleMap[MIN_ZOOM_LEVEL],
        zoomLeveltoScaleMap[MAX_ZOOM_LEVEL]
      );

      const invertX = (e.clientX - topLeftX) / scale;
      const invertY = (e.clientY - topLeftY) / scale;

      const updatedTopLeftX = e.clientX - invertX * updatedScale;
      const updatedTopLeftY = e.clientY - invertY * updatedScale;

      return [updatedTopLeftX, updatedTopLeftY, updatedScale];
    }

    function pan() {
      const updatedTopLeftX = topLeftX + -e.deltaX;
      const updatedTopLeftY = topLeftY + -e.deltaY;

      return [updatedTopLeftX, updatedTopLeftY];
    }

    let [updatedTopLeftX, updatedTopLeftY, updatedScale] = [
      topLeftX,
      topLeftY,
      scale,
    ];
    if (e.metaKey || isPinchToZoom) {
      [updatedTopLeftX, updatedTopLeftY, updatedScale] = zoom();
    } else {
      [updatedTopLeftX, updatedTopLeftY] = pan();
    }

    setScale(updatedScale);
    setTopLeftX(updatedTopLeftX);
    setTopLeftY(updatedTopLeftY);
    setZoomLevel(zoomLevelBucket(zoomLevel, updatedScale));
    debouncedOnWheelEnd(
      dispatch,
      e.clientX,
      e.clientY,
      updatedTopLeftX,
      updatedTopLeftY,
      updatedScale,
      zoomLevel
    );
  }

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    const x = (e.clientX - topLeftX) / scale;
    const y = (e.clientY - topLeftY) / scale;

    const text = newShape(boardId, {
      type: 'text',
      x: x - SHAPE_WIDTH / 2,
      y: y - SHAPE_HEIGHT / 2,
    });

    dispatch(updateDrawings([text]));
  }

  return (
    <>
      <svg
        id="odys-canvas"
        style={{
          height: '100%',
          width: '100%',
          background: COLORS.canvas,
        }}
        onPointerMove={(e) => handlePointerMove(e)}
        onPointerDown={(e) => handlePointerDown(e)}
        onPointerUp={(e) => handlePointerUp(e)}
        onPointerLeave={(e) => handlePointerLeave(e)}
        cursor={cursor}
        ref={svgRef}
      >
        <g id="odys-zoomable-group" transform={transform}>
          {/* This canvas-background is a sibling to the drawings.
            This is useful for pointer enter/leave events.
            It scales to the size of the canvas */}
          <g
            className="canvas-background"
            transform={`translate(${topLeftX * (1 / scale) * -1}, ${
              topLeftY * (1 / scale) * -1
            }) scale(${1 / scale})`}
            onDoubleClick={(e) => handleDoubleClick(e)}
            onPointerOver={
              shouldIgnorePointerOver ? undefined : (e) => handlePointerOver(e)
            }
          >
            {/* TODO: 8000 magic number should equal screen width/height on initial load */}
            <rect height="8000" width="8000" opacity="0"></rect>
          </g>
          <DrawContainer></DrawContainer>
          <MultiSelect></MultiSelect>
          <PlayerSelectBoxes></PlayerSelectBoxes>
          <Cursors></Cursors>
          <Ghosts></Ghosts>
        </g>
      </svg>
      <HiddenTextInput
        topLeftX={topLeftX}
        topLeftY={topLeftY}
        scale={scale}
      ></HiddenTextInput>
    </>
  );
};

export default Canvas;
