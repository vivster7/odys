import React from 'react';
import { isEmpty } from 'lodash';
import { useSelector } from 'global/redux';
import { COLORS } from 'global/colors';

const LandingPage: React.FC = () => {
  const platform = window.navigator.platform;
  const optionOrAlt = platform.includes('Mac') ? 'Option' : 'Alt';

  const showEmptyState = useSelector(
    (s) => isEmpty(s.draw.shapes) && isEmpty(s.draw.arrows)
  );

  return (
    <>
      {showEmptyState ? (
        <div
          style={{
            position: 'absolute',
            top: '45%',
            textAlign: 'center',
            width: '100%',
            color: COLORS.tooltipText,
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          ⌥ [{optionOrAlt}] + Click to draw your first box
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default LandingPage;
