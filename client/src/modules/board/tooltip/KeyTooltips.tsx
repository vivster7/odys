import React from 'react';
import KeyToggle from './KeyToggle';
import { useSelector } from 'global/redux';

const KeyTooltips: React.FC = () => {
  const isAltPressed = useSelector((s) => s.keyboard.altKey);
  const isShiftPressed = useSelector((s) => s.keyboard.shiftKey);

  const platform = window.navigator.platform;
  const optionOrAlt = platform.includes('Mac') ? 'Option' : 'Alt';

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
