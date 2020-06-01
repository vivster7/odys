import React from 'react';
import { shallowEqual } from 'react-redux';
import { useSelector } from 'global/redux';
import { COLORS } from 'global/colors';

interface OnlinePlayer {
  id: string;
  color: string;
}

const OnlinePlayer: React.FC<OnlinePlayer> = (props) => {
  return (
    <div
      style={{
        borderBottom: `3px solid ${props.color}`,
        padding: '5px',
        marginRight: '10px',
        backgroundColor: COLORS.cockpitUnselectedBg,
        color: props.color,
      }}
    >
      {props.id.slice(0, 2).toLocaleUpperCase()}
    </div>
  );
};

const OnlinePlayers: React.FC = () => {
  const players = useSelector(
    (s) =>
      Object.values(s.players.players).map((p) =>
        Object.assign({}, { id: p.id, color: p.color })
      ),
    shallowEqual
  );

  return (
    <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
      {players.map((p) => (
        <OnlinePlayer key={p.id} id={p.id} color={p.color}></OnlinePlayer>
      ))}
    </div>
  );
};

export default OnlinePlayers;
