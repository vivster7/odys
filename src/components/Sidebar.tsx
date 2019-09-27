import React from 'react';

const Sidebar: React.FC = props => {
  return <div className="flex-elem">{props.children}</div>;
};

export default Sidebar;
