import { useState, useEffect, Dispatch } from 'react';
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

export function useDebounce(value: any, delay: number) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Set debouncedValue to value (passed in) after the specified delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Return a cleanup function that will be called every time ...
      // ... useEffect is re-called. useEffect will only be re-called ...
      // ... if value changes (see the inputs array below).
      // This is how we prevent debouncedValue from changing if value is ...
      // ... changed within the delay period. Timeout gets cleared and restarted.
      // To put it in context, if the user is typing within our app's ...
      // ... search box, we don't want the debouncedValue to update until ...
      // ... they've stopped typing for more than 500ms.
      return () => {
        clearTimeout(handler);
      };
    },
    // Only re-call effect if value changes
    // You could also add the "delay" var to inputs array if you ...
    // ... need to be able to change that dynamically.
    [value, delay]
  );

  return debouncedValue;
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
