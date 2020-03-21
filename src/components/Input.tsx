// Input element is a relative postitioned.
// Its placed at the x,y screen coords.
//
// This trick enables editing text in SVG
import React from 'react';

export interface InputProps extends React.HTMLProps<HTMLDivElement> {
  x: number;
  y: number;
  text: string;
}

const Input: React.FC<InputProps> = props => {
  return (
    <div
      contentEditable={true}
      style={{
        minHeight: '1em',
        backgroundColor: 'orange',
        position: 'relative',
        top: props.x,
        left: props.y
      }}
    >
      {props.text}
    </div>
  );
};

export default Input;
