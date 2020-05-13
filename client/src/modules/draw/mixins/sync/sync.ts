import { useEffect } from 'react';
import socket from 'socket/socket';

export interface Syncable {
  id: string;
  isLastUpdatedBySync: boolean;
  isSavedInDB: boolean; // TODO: move to separate mixin
}

export function useDrawingChangeEmitter(subject: Syncable) {
  useEffect(() => {
    if (subject.isLastUpdatedBySync) {
      return;
    }
    socket.emit('shapeChange', { ...subject });
  }, [subject]);
}
