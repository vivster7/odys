import React from 'react';
import HelpButton from './HelpButton';
import FeedbackButton from './FeedbackButton';

const ToolTips: React.FC = () => {
  return (
    <>
      <div
        style={{
          display: 'flex',
          flexFlow: 'row nowrap',
          pointerEvents: 'all',
        }}
      >
        <HelpButton></HelpButton>
        <FeedbackButton></FeedbackButton>
      </div>
    </>
  );
};

export default ToolTips;
