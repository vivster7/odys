import React, { useEffect, useState } from 'react';
import { ShapeTypeProps } from '../Shape';
import BaseShape from './BaseShape';
import { useDispatch } from 'react-redux';
import { deleteDrawings } from 'modules/draw/mixins/delete/delete.reducer';

const Text: React.FC<ShapeTypeProps> = (props) => {
  const dispatch = useDispatch();
  const [hasBeenSelected, setHasBeenSelected] = useState(false);
  const { isSelected, isDragging, shape } = props;
  const cursor = isDragging ? 'grabbing' : 'grab';
  const fill = 'white';
  const fillOpacity = 0;
  const strokeColor = 'none';
  const strokeDasharray = 0;
  const justifyContent = 'start';
  const alignItems = 'start';
  const textAlign = 'left' as const;
  const childProps = {
    ...props,
    cursor,
    fill,
    fillOpacity,
    strokeColor,
    strokeDasharray,
    justifyContent,
    alignItems,
    textAlign,
  };

  if (!hasBeenSelected && isSelected) {
    setHasBeenSelected(true);
  }

  // Text will delete itself if empty
  useEffect(() => {
    if (shape.text === '' && !isSelected && hasBeenSelected) {
      console.log('notSelected -- will delete!');
      dispatch(deleteDrawings({ ids: [shape.id] }));
    }
  }, [dispatch, isSelected, shape.text, shape.id, hasBeenSelected]);

  return <BaseShape {...childProps}></BaseShape>;
};

export default Text;
