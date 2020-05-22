import React, { useState } from 'react';
import { COLORS } from 'global/colors';

interface KeyToggle {
  isToggled: boolean;
  tips: string[];
}

interface KeyTogglePopup {
  fitToContent?: boolean;
}

const KeyToggle: React.FC<KeyToggle> = (props) => {
  const { isToggled, tips } = props;
  const color = isToggled ? COLORS.textContrast : COLORS.secondaryText;
  const backgroundColor = isToggled
    ? COLORS.cockpitSelectedBg
    : COLORS.cockpitUnselectedBg;
  const boxShadow = isToggled ? '' : `0px 4px 2px -2px ${COLORS.dropShadow}`;

  const [isHovered, setIsHovered] = useState(false);

  const KeyTogglePopup: React.FC<KeyTogglePopup> = (props) => {
    return (
      <div
        style={{
          fontSize: '12px',
          fontWeight: 600,
          borderRadius: '4px',
          backgroundColor: COLORS.cockpitSelectedBg,
          color: COLORS.textContrast,
          padding: '12px',
          marginTop: '8px',
          width: props.fitToContent ? 'max-content' : 'auto',
          maxWidth: '300px',
          lineHeight: '1rem',
        }}
      >
        {props.children}
      </div>
    );
  };

  const renderActionTips = () => {
    return (
      <div
        style={{
          position: 'absolute',
          fontSize: '10px',
          bottom: '50px',
          left: '0',
          width: '400px',
        }}
      >
        {tips.map((tip, idx) => {
          return <KeyTogglePopup key={idx}>{tip}</KeyTogglePopup>;
        })}
      </div>
    );
  };

  return (
    <>
      {isHovered ? renderActionTips() : <></>}
      <div style={{ position: 'relative' }}>
        <div
          onPointerOver={(_) => setIsHovered(true)}
          onPointerLeave={(_) => setIsHovered(false)}
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
          {props.children}
        </div>
      </div>
    </>
  );
};

export default KeyToggle;
