import React from 'react';
import KeyToggle from './KeyToggle';
import { useSelector } from 'global/redux';

const KeyTooltips: React.FC = () => {
  const isCmdPressed = useSelector((s) => s.keyboard.cmdKey);

  const platform = window.navigator.platform;
  const isMac = platform.includes('Mac');
  const icon = isMac ? '⌘' : 'Ctrl';
  const toggleText = isMac ? '⌘ [Command]' : 'Ctrl';

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
            `Box:   ${icon} + Click`,
            `Arrow: ${icon} + Click with a selected box`,
            'Text: Double Click',
          ]}
        >
          {toggleText}
        </KeyToggle>
      </div>
    </>
  );
};

export default KeyTooltips;
