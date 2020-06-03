import React from 'react';
import KeyToggle from './KeyToggle';
import { useSelector } from 'global/redux';

const KeyTooltips: React.FC = () => {
  const isShiftPressed = useSelector((s) => s.keyboard.shiftKey);
  const isCmdPressed = useSelector((s) => s.keyboard.cmdKey);

  const platform = window.navigator.platform;
  const cmdOrCtrl = platform.includes('Mac') ? 'Command' : 'Ctrl';

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexFlow: 'row nowrap',
          pointerEvents: 'all',
        }}
      >
        <KeyToggle
          isToggled={isCmdPressed}
          tips={[
            '⌥ + Click to draw a box',
            '⌥ + Click to draw arrow from selected box',
            '⌘ + A to select all',
            '⌘ + Z to undo',
            '⌘ + ⇧ + Z to redo',
          ]}
        >
          ⌘ [{cmdOrCtrl}]
        </KeyToggle>
        <KeyToggle
          isToggled={isShiftPressed}
          tips={['⇧ + Click (or Drag) to multi-select']}
        >
          ⇧ [Shift]
        </KeyToggle>
      </div>
    </>
  );
};

export default KeyTooltips;
