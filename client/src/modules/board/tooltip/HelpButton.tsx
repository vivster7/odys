import React, { useState } from 'react';
import { COLORS } from 'global/colors';
import Tips from './Tips';

interface HelpButton {}

const HelpButton: React.FC<HelpButton> = (props) => {
  const platform = window.navigator.platform;
  const isMac = platform.includes('Mac');
  const icon = isMac ? '⌘' : 'Ctrl';

  const [isToggled, setIsToggled] = useState(false);

  const color = isToggled ? COLORS.textContrast : COLORS.secondaryText;
  const backgroundColor = isToggled
    ? COLORS.cockpitSelectedBg
    : COLORS.cockpitUnselectedBg;
  const boxShadow = isToggled ? '' : `0px 4px 2px -2px ${COLORS.dropShadow}`;

  function onPointerOver(e: React.PointerEvent) {
    setIsToggled(true);
  }
  function onPointerLeave(e: React.PointerEvent) {
    setIsToggled(false);
  }

  return (
    <>
      <div
        style={{
          position: 'absolute',
          fontSize: '10px',
          bottom: '50px',
          left: '0',
          width: '400px',
          visibility: isToggled ? 'visible' : 'hidden',
        }}
      >
        <Tips
          tips={[
            `Box:   ${icon} + Click`,
            `Arrow: ${icon} + Click with a selected box`,
            'Text: Double Click',
          ]}
        ></Tips>
      </div>
      <div style={{ position: 'relative' }}>
        <div
          onPointerOver={(e) => onPointerOver(e)}
          onPointerLeave={(e) => onPointerLeave(e)}
          style={{
            color: color,
            backgroundColor: backgroundColor,
            borderRadius: '4px',
            boxShadow: boxShadow,
            padding: '12px',
            marginRight: '10px',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          Help
        </div>
      </div>
    </>
  );
};

export default HelpButton;
