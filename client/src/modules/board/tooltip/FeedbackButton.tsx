import React from 'react';
import { COLORS } from 'global/colors';
import { useDispatch } from 'react-redux';
import { openFeedback, closeFeedback } from '../board.reducer';
import { useSelector } from 'global/redux';
import Feedback from './Feedback';
import { cancelSelect } from 'modules/draw/draw.reducer';

interface FeedbackButton {}

const FeedbackButton: React.FC<FeedbackButton> = (props) => {
  const dispatch = useDispatch();
  const isOpen = useSelector((s) => s.board.isFeedbackOpen);

  const color = isOpen ? COLORS.textContrast : COLORS.secondaryText;
  const backgroundColor = isOpen
    ? COLORS.cockpitSelectedBg
    : COLORS.cockpitUnselectedBg;
  const boxShadow = isOpen ? '' : `0px 4px 2px -2px ${COLORS.dropShadow}`;

  function onClick(e: React.MouseEvent) {
    if (isOpen) {
      dispatch(closeFeedback());
    } else {
      dispatch(openFeedback());
      dispatch(cancelSelect());
    }
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
          visibility: isOpen ? 'visible' : 'hidden',
        }}
      >
        <Feedback></Feedback>
      </div>
      <div style={{ position: 'relative' }}>
        <div
          onClick={(e) => onClick(e)}
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
          Feedback
        </div>
      </div>
    </>
  );
};

export default FeedbackButton;
