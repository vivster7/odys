import React from 'react';
import { useSelector } from 'global/redux';
import SelectBox from './SelectBox';
import Box from 'math/box';
import { shallowEqual, useDispatch } from 'react-redux';
import { useSelectBoxResizeListener } from 'modules/players/mixins/selectbox/selectbox';

const PlayerSelectBoxes: React.FC = () => {
  const dispatch = useDispatch();
  useSelectBoxResizeListener(dispatch);

  const players = useSelector((s) => s.players.players, shallowEqual);
  const selectBoxes = useSelector(
    (s) =>
      Object.values(s.players.selectBoxes).filter((b) => b.selectBox !== null),
    shallowEqual
  );

  return (
    <>
      {selectBoxes.map((s) => {
        const player = players[s.playerId];
        return (
          <SelectBox
            key={player.id}
            box={s.selectBox as Box}
            fillColor={player.color}
            strokeColor={player.color}
          ></SelectBox>
        );
      })}
    </>
  );
};

export default PlayerSelectBoxes;
