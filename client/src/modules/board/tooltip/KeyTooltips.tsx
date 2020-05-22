import React, { useState, useEffect } from 'react';
import KeyToggle from './KeyToggle';

const KeyTooltips: React.FC = () => {
  const [isAltPressed, setAltPressed] = useState(false);
  const [isShiftPressed, setShiftPressed] = useState(false);

  const platform = window.navigator.platform;
  const optionOrAlt = platform.includes('Mac') ? 'Option' : 'Alt';

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'AltLeft' || e.code === 'AltRight') {
        setAltPressed(true);
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setShiftPressed(true);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'AltLeft' || e.code === 'AltRight') {
        setAltPressed(false);
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setShiftPressed(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  });

  return (
    <>
      <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
        <KeyToggle
          isToggled={isAltPressed}
          tips={[
            '⌥ + Click to draw a box',
            '⌥ + Drag to draw a grouping box',
            'With a selected box, ⌥ + Click to draw arrow to another box',
          ]}
        >
          ⌥ [{optionOrAlt}]
        </KeyToggle>
        <KeyToggle
          isToggled={isShiftPressed}
          tips={[
            '⇧ + Click to select multiple boxes',
            '⇧ + Drag to select multiple boxes',
          ]}
        >
          ⇧ [Shift]
        </KeyToggle>
      </div>
    </>
  );
};

export default KeyTooltips;
