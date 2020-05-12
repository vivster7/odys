import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { RootState } from 'App';
import { addError } from 'modules/errors/errors.reducer';

import Text from './type/Text';
import Rect from './type/Rect';
import GroupingRect from './type/GroupingRect';
import { useShapeChangeEmitter } from '../mixins/sync/sync';

export interface ShapeId {
  id: string;
}

export const Shape: React.FC<ShapeId> = (props) => {
  const { id } = props;
  const shape = useSelector((state: RootState) => state.draw.shapes[id]);
  const dispatch = useDispatch();
  useShapeChangeEmitter(shape);

  if (shape?.type === 'rect') return <Rect id={id}></Rect>;
  if (shape?.type === 'text') return <Text id={id}></Text>;
  if (shape?.type === 'grouping_rect')
    return <GroupingRect id={id}></GroupingRect>;

  dispatch(addError(`unknown shape ${id}`));
  return <></>;
};
