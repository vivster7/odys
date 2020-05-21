import React, { useState } from 'react';
import { COLORS } from 'modules/draw/mixins/colors/colors';

interface KeyToggle {
  isToggled: boolean;
  popupText: string;
}

interface KeyTogglePopup {
  shouldDisplay: boolean;
}

const KeyToggle: React.FC<KeyToggle> = (props) => {
  const { isToggled, popupText } = props;
  const color = isToggled ? COLORS.select : COLORS.text;
  const backgroundColor = isToggled
    ? COLORS.cockpitSelectedBg
    : COLORS.cockpitUnselectedBg;
  const boxShadow = isToggled ? '' : '0px 4px 2px -2px grey';

  const [isHovered, setIsHovered] = useState(false);

  const KeyTogglePopup: React.FC<KeyTogglePopup> = (props) => {
    if (!props.shouldDisplay) return <></>;
    return (
      <div
        style={{
          position: 'absolute',
          fontSize: '10px',
          top: '-12px',
          left: '-20px',
          width: '100px',
        }}
      >
        {props.children}
      </div>
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      <KeyTogglePopup shouldDisplay={isHovered}>{popupText}</KeyTogglePopup>
      <div
        onPointerOver={(_) => setIsHovered(true)}
        onPointerLeave={(_) => setIsHovered(false)}
        style={{
          color: color,
          backgroundColor: backgroundColor,
          borderRadius: '50%',
          boxShadow: boxShadow,
          border: '1px rgba(204,204,204,0.5) solid',
          padding: '12px',
          marginRight: '4px',
        }}
      >
        {props.children}
      </div>
    </div>
  );
};

export default KeyToggle;
