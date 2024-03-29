import React, { useState } from 'react';
import BaseShape from './BaseShape';
import { ShapeTypeProps } from '../Shape';
import { COLORS } from 'global/colors';
import { useDispatch } from 'react-redux';
import { Shape } from '../shape.reducer';
import { createGroup, ungroup } from '../group.reducer';
import uuid from 'uuid';

const GroupingRect: React.FC<ShapeTypeProps> = (props) => {
  const { isSelected, isDragging } = props;
  const cursor = isSelected ? (isDragging ? 'grabbing' : 'grab') : 'pointer';
  const fill = COLORS.groupingRectBG;
  const fillOpacity = 0.15;
  const strokeDasharray = 0;
  const strokeColor = COLORS.groupingRectDefault;
  const justifyContent = 'center';
  const alignItems = 'start';
  const textAlign = 'center' as const;
  const placeholderText = 'Click to edit group name';
  const childProps = {
    ...props,
    cursor,
    fill,
    fillOpacity,
    strokeColor,
    strokeDasharray,
    placeholderText,
    justifyContent,
    alignItems,
    textAlign,
  };
  return <BaseShape {...childProps}></BaseShape>;
};

interface CreateGroup {
  width: number;
  height: number;
}

export const CreateGroup: React.FC<CreateGroup> = (props) => {
  const { width, height } = props;
  const dispatch = useDispatch();
  const [isPushed, setIsPushed] = useState(false);

  const xOffset = -55;
  const yOffset = 15;
  const fontSize = 12;
  const fontColor = isPushed ? COLORS.textContrast : COLORS.createGroupText;

  function handlePointerDown(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsPushed(true);
  }

  function handlePointerUp(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsPushed(false);
    dispatch(createGroup(uuid.v4()));
  }

  function handlePointerLeave(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsPushed(false);
  }

  return (
    <text
      cursor="pointer"
      x={width + xOffset}
      y={height + yOffset}
      onPointerLeave={(e) => handlePointerLeave(e)}
      onPointerDown={(e) => handlePointerDown(e)}
      onPointerUp={(e) => handlePointerUp(e)}
      fill={fontColor}
      fontSize={fontSize + 'px'}
    >
      Group (G)
    </text>
  );
};

interface UngroupProps {
  shape: Shape;
}

export const Ungroup: React.FC<UngroupProps> = (props) => {
  const { id, width, height } = props.shape;
  const dispatch = useDispatch();
  const [isPushed, setIsPushed] = useState(false);

  const xOffset = -65;
  const yOffset = 15;
  const fontSize = 12;
  const fontColor = isPushed ? COLORS.textContrast : COLORS.createGroupText;

  function handlePointerDown(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsPushed(true);
  }

  function handlePointerUp(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsPushed(false);
    dispatch(ungroup(id));
  }

  function handlePointerLeave(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsPushed(false);
  }

  return (
    <text
      x={width + xOffset}
      y={height + yOffset}
      cursor="pointer"
      onPointerDown={(e) => handlePointerDown(e)}
      onPointerUp={(e) => handlePointerUp(e)}
      onPointerLeave={(e) => handlePointerLeave(e)}
      fill={fontColor}
      fontSize={fontSize + 'px'}
    >
      Ungroup (G)
    </text>
  );
};

export default GroupingRect;
