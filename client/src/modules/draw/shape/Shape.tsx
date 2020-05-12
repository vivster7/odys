import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { RootState } from 'App';
import { addError } from 'modules/errors/errors.reducer';
import socket from 'socket/socket';

import Text from './type/Text';
import Rect from './type/Rect';
import GroupingRect from './type/GroupingRect';
import { Syncable } from '../sync/sync.reducer';

export type ShapeType = 'rect' | 'text' | 'arrow' | 'grouping_rect';

export interface ShapeId {
  id: string;
}

export const NewShape: React.FC<ShapeId> = (props) => {
  const { id } = props;
  const shape = useSelector((state: RootState) => state.draw.shapes[id]);
  const dispatch = useDispatch();

  if (shape?.type === 'rect') return <Rect id={id}></Rect>;
  if (shape?.type === 'text') return <Text id={id}></Text>;
  if (shape?.type === 'grouping_rect')
    return <GroupingRect id={id}></GroupingRect>;

  dispatch(addError(`unknown shape ${id}`));
  return <></>;
};

export function useShapeChangeEmitter(subject: Syncable) {
  useEffect(() => {
    if (subject.isLastUpdatedBySync) {
      return;
    }
    socket.emit('shapeChange', { ...subject });
  }, [subject]);
}
