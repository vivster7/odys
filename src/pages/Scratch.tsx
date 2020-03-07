// Scratch page to experiment with React Components
import React from 'react';

const Scratch: React.FC = () => {
  function handleMouseDown(e: React.MouseEvent) {
    console.log(e);
  }

  return <h1 onMouseDown={e => handleMouseDown(e)}>Testing</h1>;
};

export default Scratch;
