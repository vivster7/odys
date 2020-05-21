import { useEffect, Dispatch } from 'react';
import { PayloadAction } from '@reduxjs/toolkit';
import { emitEvent, registerSocketListener, ClientEvent } from 'socket/socket';
import { instanceOfArrow } from 'modules/draw/arrow/arrow.reducer';
import { syncDrawing, Drawing } from 'modules/draw/draw.reducer';

import {
  updatePlayerSelection,
  PlayerSelection,
} from 'modules/players/players.reducer';

export interface Syncable {
  id: string;
  isLastUpdatedBySync: boolean;
}

export function useDrawingChangedEmitter(subject?: Syncable) {
  useEffect(() => {
    if (!subject || subject?.isLastUpdatedBySync) {
      return;
    }
    emitEvent('drawingChanged', { ...subject });
  }, [subject]);
}

export function useDrawingChangedListener(
  dispatch: Dispatch<PayloadAction<Drawing | PlayerSelection>>
) {
  useEffect(() => {
    const onDrawingChanged = (event: ClientEvent) => {
      dispatch(syncDrawing(event.data));
      if (!instanceOfArrow(event.data)) {
        dispatch(
          updatePlayerSelection({
            select: event.data.id,
            id: event.clientId,
          })
        );
      }
    };
    return registerSocketListener('drawingChanged', onDrawingChanged);
  }, [dispatch]);
}
