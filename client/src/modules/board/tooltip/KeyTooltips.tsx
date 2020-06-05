import React from 'react';
import KeyToggle from './KeyToggle';
import { useSelector } from 'global/redux';

const KeyTooltips: React.FC = () => {
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
            'Box:   ⌥ + Click',
            'Arrow: ⌥ + Click with a selected box',
            'Text: Double Click',
          ]}
        >
          ⌘ [{cmdOrCtrl}]
        </KeyToggle>
      </div>
    </>
  );
};

export default KeyTooltips;
