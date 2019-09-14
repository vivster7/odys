import React, { useState, Dispatch, SetStateAction } from 'react';
import DrawingBoard from './DrawingBoard';
import Shape from './shapes/Shape';

export const ShapesContext = React.createContext({
  shapes: [] as Shape[],
  setShapes: ((): never => {
    throw new Error(
      'setShapes function missing. Is a ShapesContext.Provider loaded above calling component?'
    );
  }) as Dispatch<SetStateAction<Shape[]>>
});

const App: React.FC = () => {
  const [shapes, setShapes] = useState<Shape[]>([]);

  return (
    <ShapesContext.Provider value={{ shapes, setShapes }}>
      <DrawingBoard></DrawingBoard>
    </ShapesContext.Provider>
  );
};

export default App;
