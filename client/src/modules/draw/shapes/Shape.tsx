import React from 'react';
import { v4 } from 'uuid';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../App';
import Rect from './Rect';
import Arrow from './Arrow';
import Text from './Text';
import { addError } from '../../errors/errors.reducer';

export type ShapeType = 'rect' | 'text' | 'arrow';

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
  const shape = useSelector((state: RootState) => state.shapes.data[id]);
  const dispatch = useDispatch();

  if (!shape) return <></>;
  if (shape.type === 'rect') return <Rect id={id}></Rect>;
  if (shape.type === 'arrow') return <Arrow id={id}></Arrow>;
  if (shape.type === 'text') return <Text id={id}></Text>;
  dispatch(addError(`unknown shape: ${shape.type}`));
  return <></>;
};

// Shape can be drawn inside an SVG.
export default interface Shape {
  id: string;
  type: ShapeType;
  isLastUpdatedBySync: boolean;
}
