import { PayloadAction } from '@reduxjs/toolkit';
import { ShapeReducer } from '../../draw.reducer';
import { RectProps } from '../type/Rect';

export type NEAnchor = 'NEAnchor';
export type NWAnchor = 'NWAnchor';
export type SEAnchor = 'SEAnchor';
export type SWAnchor = 'SWAnchor';
export type Anchor = NEAnchor | NWAnchor | SEAnchor | SWAnchor;

export interface ResizeState {
  id: string;
  anchor: Anchor;
  originalX: number;
  originalY: number;
  clickX: number;
  clickY: number;
}

interface StartResize {
  id: string;
  anchor: Anchor;
  originalX: number;
  originalY: number;
}

interface Resize {
  clickX: number;
  clickY: number;
  svgScale: number;
}

export const startResizeFn: ShapeReducer<PayloadAction<StartResize>> = (
  state,
  action
) => {
  state.resize = {
    id: action.payload.id,
    anchor: action.payload.anchor,
    originalX: action.payload.originalX,
    originalY: action.payload.originalY,
    clickX: 0,
    clickY: 0,
  };
};

export const resizeFn: ShapeReducer<PayloadAction<Resize>> = (
  state,
  action
) => {
  if (!state.resize) {
    throw new Error(
      'Cannot ODYS_RESIZE_ACTION without `state.resize` (did ODYS_START_RESIZE_ACTION fire first?)'
    );
  }

  const { id } = state.resize;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  const { clickX, clickY, svgScale } = action.payload;
  const { originalX, originalY } = state.resize;

  let translateX = 0;
  let translateY = 0;
  let deltaWidth = 0;
  let deltaHeight = 0;
  switch (state.resize.anchor) {
    case 'SEAnchor':
      deltaWidth = (clickX - originalX) / svgScale;
      deltaHeight = (clickY - originalY) / svgScale;
      break;
    case 'SWAnchor':
      translateX = (clickX - originalX) / svgScale;
      deltaWidth = (originalX - clickX) / svgScale;
      deltaHeight = (clickY - originalY) / svgScale;
      break;
    case 'NEAnchor':
      translateY = (clickY - originalY) / svgScale;
      deltaWidth = (clickX - originalX) / svgScale;
      deltaHeight = (originalY - clickY) / svgScale;
      break;
    case 'NWAnchor':
      translateX = (clickX - originalX) / svgScale;
      translateY = (clickY - originalY) / svgScale;
      deltaWidth = (originalX - clickX) / svgScale;
      deltaHeight = (originalY - clickY) / svgScale;
      break;
    default:
      throw new Error(`Unknown anchor point ${state.resize.anchor}`);
  }

  const shape = state.shapes[id] as RectProps;
  shape.translateX = translateX;
  shape.translateY = translateY;
  shape.deltaWidth = deltaWidth;
  shape.deltaHeight = deltaHeight;
  shape.isLastUpdatedBySync = false;
};

export const endResizeFn: ShapeReducer<PayloadAction> = (state, action) => {
  if (!state.resize) {
    throw new Error(
      'Could not end resize shape action. Was it started with ODYS_START_RESIZE_ACTION?'
    );
  }

  const { id } = state.resize;
  if (!state.shapes[id]) {
    throw new Error(`Cannot find shape with ${id}`);
  }

  const shape = state.shapes[id] as RectProps;
  shape.x = shape.x + shape.translateX;
  shape.y = shape.y + shape.translateY;
  shape.translateX = 0;
  shape.translateY = 0;
  shape.width = shape.width + shape.deltaWidth;
  shape.height = shape.height + shape.deltaHeight;
  shape.deltaWidth = 0;
  shape.deltaHeight = 0;
  shape.isLastUpdatedBySync = false;

  state.drag = null;
  state.newRectByClick = null;
  state.resize = null;
};
