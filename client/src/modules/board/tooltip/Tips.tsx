import React from 'react';
import { COLORS } from 'global/colors';

interface Tip {
  fitToContent?: boolean;
}

const Tip: React.FC<Tip> = (props) => {
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

interface Tips {
  tips: string[];
}

const Tips: React.FC<Tips> = (props) => {
  const { tips } = props;
  return (
    <>
      {tips.map((tip, idx) => {
        return <Tip key={idx}>{tip}</Tip>;
      })}
    </>
  );
};

export default Tips;
