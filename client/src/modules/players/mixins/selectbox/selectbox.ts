/**
 * This file is responsible for syncing the resizable selection rectangle
 * between players.
 *
 * It is not responsible for what players have selected what.
 * See: players/mixins/sync/sync.reducers.ts
 */
import { useEffect } from 'react';
import { emitEvent, registerSocketListener, ClientEvent } from 'socket/socket';
import { OdysDispatch } from 'App';
import Box from 'math/box';
import { syncSelectBox } from 'modules/players/players.reducer';

export interface PlayerSelectBox {
  playerId: string;
  selectBox: Box | null;
}

export function useSelectBoxResizeListener(dispatch: OdysDispatch) {
  useEffect(() => {
    const onSelectBoxResize = (event: ClientEvent) => {
      dispatch(
        syncSelectBox({
          playerId: event.playerId,
          selectBox: event.data,
        })
      );
    };
    return registerSocketListener('selectBoxResize', onSelectBoxResize);
  }, [dispatch]);
}

export function useSelectBoxResizeEmitter(selectBox?: Box | null) {
  useEffect(() => {
    emitEvent('selectBoxResize', { ...selectBox });
  }, [selectBox]);
}
