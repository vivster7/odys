import React, { useEffect } from 'react';
import { ShapeTypeProps } from '../Shape';
import BaseShape from './BaseShape';
import { useDispatch } from 'react-redux';
import { deleteDrawings } from 'modules/draw/mixins/delete/delete.reducer';

const Text: React.FC<ShapeTypeProps> = (props) => {
  const dispatch = useDispatch();
  const { isSelected, isDragging, shape } = props;
  const cursor = isDragging ? 'grabbing' : 'grab';
  const fill = 'white';
  const fillOpacity = 0;
  const strokeColor = 'none';
  const strokeDasharray = 0;
  const alignText = 'center';
  const childProps = {
    ...props,
    cursor,
    fill,
    fillOpacity,
    strokeColor,
    strokeDasharray,
    alignText,
  };

  // Text will delete itself if empty
  useEffect(() => {
    if (shape.text === '' && !isSelected) {
      dispatch(deleteDrawings({ ids: [shape.id] }));
    }
  }, [dispatch, isSelected, shape.text, shape.id]);

  return <BaseShape {...childProps}></BaseShape>;
};

export default Text;
