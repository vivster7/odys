import React, { SVGProps } from 'react';
import { v4 } from 'uuid';

const Group: React.FC<SVGProps<SVGGElement>> = props => {
  const id = props.id || `id-${v4()}`;
  return (
    <g id={id} transform={props.transform}>
      {props.children}
    </g>
  );
};

export default Group;
