import { useEffect } from 'react';
import _ from 'lodash';

import socket from 'socket/socket';

export interface Deleteable {
  id: string;
  deleted: boolean;
}

interface DeleteData {
  [id: string]: Deleteable;
}

export function useDrawingDeleteDiff(
  prevDrawings: DeleteData,
  currDrawings: DeleteData
) {
  useEffect(() => {
    const deletedDrawings = _.values(currDrawings).filter(
      (drawing) => drawing.deleted
    );
    const unsyncedDeletions = deletedDrawings.filter((drawing) => {
      const _drawing = prevDrawings[drawing.id];
      return !_drawing?.deleted;
    });
    unsyncedDeletions.map((deleted) =>
      socket.emit('shapeChange', { ...deleted })
    );
  });
}
