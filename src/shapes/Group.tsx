import React, { ReactNode } from 'react';

export interface GroupProps extends React.SVGProps<SVGGElement> {
  id: string;
  children: ReactNode;
  transform: string;
  cursor: 'grab' | 'grabbing' | string;
}

const Group: React.FC<GroupProps> = props => {
  const { children, ...rest } = props;
  return <g {...rest}>{children}</g>;
};

export default Group;
