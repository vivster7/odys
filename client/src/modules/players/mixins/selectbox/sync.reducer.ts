import { PlayersReducer } from 'modules/players/players.reducer';
import { PlayerSelectBox } from './selectbox';

export const syncSelectBoxFn: PlayersReducer<PlayerSelectBox> = (
  state,
  action
) => {
  const { playerId, selectBox } = action.payload;
  if (!state.players[playerId]) {
    if (state.selectBoxes[playerId]) {
      delete state.selectBoxes[playerId];
    }
    return;
  }

  state.selectBoxes[playerId] = {
    playerId,
    selectBox,
  };
};
