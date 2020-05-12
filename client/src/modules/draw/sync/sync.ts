import { useEffect } from 'react';
import socket from 'socket/socket';

export interface Syncable {
  id: string;
  isLastUpdatedBySync: boolean;
}

export function useShapeChangeEmitter(subject: Syncable) {
  useEffect(() => {
    if (subject.isLastUpdatedBySync) {
      return;
    }
    socket.emit('shapeChange', { ...subject });
  }, [subject]);
}
