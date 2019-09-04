import React from 'react';

interface GroupProps extends React.SVGProps<SVGGElement> {
  transform: any; // D3 event.transform of `any`type
}

const Group: React.FC<GroupProps> = (props: GroupProps) => {
  return <g transform={props.transform}>{props.children}</g>;
};

export default Group;
