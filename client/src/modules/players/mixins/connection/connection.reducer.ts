import { useEffect } from 'react';
import {
  PlayersReducer,
  connectPlayers,
  disconnectPlayer,
  Player,
} from 'modules/players/players.reducer';
import { registerSocketListener } from 'socket/socket';
import { OdysDispatch } from 'App';

export const connectPlayersFn: PlayersReducer<Player[]> = (state, action) => {
  const players = action.payload;

  players.forEach((p) => {
    state.players[p.id] = {
      id: p.id,
      color: p.color,
    };
  });
};

export const disconnectPlayerFn: PlayersReducer<Player> = (state, action) => {
  const { id } = action.payload;
  if (state.players[id]) delete state.players[id];
  if (state.cursors[id]) delete state.cursors[id];
  if (state.selectBoxes[id]) delete state.selectBoxes[id];
  // filter player out from selections
  state.selections = state.selections.filter((s) => s.id !== id);
};

export function usePlayerConnectionListeners(dispatch: OdysDispatch) {
  useEffect(() => {
    const onPlayersConnected = (players: Player[]) => {
      console.log(`welcome friends ${players.map((p) => p.id)}`);
      dispatch(connectPlayers(players));
    };
    return registerSocketListener('playersConnected', onPlayersConnected);
  }, [dispatch]);

  useEffect(() => {
    const onPlayerDisonnected = (player: Player) => {
      console.log(`goodbye friend ${player}`);
      dispatch(disconnectPlayer(player));
    };
    return registerSocketListener('playerDisconnected', onPlayerDisonnected);
  }, [dispatch]);
}
