import React from 'react';
import { isEmpty } from 'lodash';
import { useSelector } from 'global/redux';
import { COLORS } from 'global/colors';

const LandingPage: React.FC = () => {
  const platform = window.navigator.platform;
  const cmdOrCtrl = platform.includes('Mac') ? 'Command' : 'Ctrl';

  const showEmptyState = useSelector(
    (s) => isEmpty(s.draw.shapes) && isEmpty(s.draw.arrows)
  );

  return (
    <>
      {showEmptyState ? (
        <div
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            top: '45%',
            textAlign: 'center',
            width: '100%',
            color: COLORS.tooltipText,
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          ⌘ [{cmdOrCtrl}] + Click to draw your first box
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default LandingPage;
