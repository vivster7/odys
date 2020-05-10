import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { v4 } from 'uuid';

import { RootState } from 'App';
import { addError } from 'modules/errors/errors.reducer';
import socket from 'socket/socket';

import Arrow from './Arrow';
import Text from './Text';
import Rect from './Rect';

export type ShapeType = 'rect' | 'text' | 'arrow';

// Shape can be drawn inside an SVG.
export default interface Shape {
  id: string;
  type: ShapeType;
  isLastUpdatedBySync: boolean;
}

export interface Draggable {
  id: string;
  x: number;
  y: number;
  translateX: number;
  translateY: number;
}

export interface Resizable {
  id: string;
  width: number;
  height: number;
  deltaWidth: number;
  deltaHeight: number;
}

export interface Selectable {
  id: string;
}

export interface TextEditable {
  id: string;
  text: string;
}

export const idFn = () => `id-${v4()}`;

export interface ShapeId {
  id: string;
}

export const NewShape: React.FC<ShapeId> = (props) => {
  const { id } = props;
  const shape = useSelector((state: RootState) => state.draw.shapes[id]);
  const dispatch = useDispatch();

  if (!shape) return <></>;
  if (shape.type === 'rect') return <Rect id={id}></Rect>;
  if (shape.type === 'arrow') return <Arrow id={id}></Arrow>;
  if (shape.type === 'text') return <Text id={id}></Text>;
  dispatch(addError(`unknown shape: ${shape.type}`));
  return <></>;
};

export function useShapeChangeEmitter(shape: Shape) {
  useEffect(() => {
    if (shape.isLastUpdatedBySync) {
      return;
    }
    socket.emit('shapeChange', { ...shape });
  }, [shape]);
}
