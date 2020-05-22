import React from 'react';
import { isEmpty } from 'lodash';
import { useSelector } from 'react-redux';
import { RootState } from 'App';
import { COLORS } from 'modules/draw/mixins/colors/colors';

const LandingPage: React.FC = () => {
  const showEmptyState = useSelector(
    (state: RootState) =>
      isEmpty(state.draw.shapes) && isEmpty(state.draw.arrows)
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
          ⌥ [Option] + Click to draw your first box
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default LandingPage;
