import React from 'react';
import KeyToggle from './KeyToggle';
import { useSelector } from 'global/redux';

const KeyTooltips: React.FC = () => {
  const isAltPressed = useSelector((s) => s.keyboard.altKey);
  const isShiftPressed = useSelector((s) => s.keyboard.shiftKey);
  const isCmdPressed = useSelector((s) => s.keyboard.cmdKey);

  const platform = window.navigator.platform;
  const optionOrAlt = platform.includes('Mac') ? 'Option' : 'Alt';
  const cmdOrCtrl = platform.includes('Mac') ? 'Command' : 'Ctrl';

  return (
    <>
      <div style={{ display: 'flex', flexFlow: 'row nowrap' }}>
        <KeyToggle
          isToggled={isAltPressed}
          tips={[
            '⌥ + Click to draw a box',
            '⌥ + Click to draw arrow from selected box',
            '⌥ + Drag to draw a grouping box',
          ]}
        >
          ⌥ [{optionOrAlt}]
        </KeyToggle>
        <KeyToggle
          isToggled={isShiftPressed}
          tips={['⇧ + Click (or Drag) to multi-select']}
        >
          ⇧ [Shift]
        </KeyToggle>
        <KeyToggle
          isToggled={isCmdPressed}
          tips={[
            '⌘ + A to select all',
            '⌘ + Z to undo',
            '⌘ + ⇧ [Shift] + Z to redo',
          ]}
        >
          ⌘ [{cmdOrCtrl}]
        </KeyToggle>
      </div>
    </>
  );
};

export default KeyTooltips;
