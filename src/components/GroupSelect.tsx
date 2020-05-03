import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../App';

const GroupSelect: React.FC = () => {
  const groupSelect = useSelector(
    (state: RootState) => state.shapes.groupSelect
  );

  if (!groupSelect) return <></>;

  return (
    <rect
      x={groupSelect.topLeftX}
      y={groupSelect.topLeftY}
      width={groupSelect.deltaWidth}
      height={groupSelect.deltaHeight}
      fill="#b3d4fc30"
      stroke="blue"
    ></rect>
  );
};

export default GroupSelect;
