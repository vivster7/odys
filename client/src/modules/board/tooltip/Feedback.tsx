import React, { useRef, useState, useEffect } from 'react';
import { COLORS } from 'global/colors';
import { useSelector } from 'global/redux';
import { useDispatch } from 'react-redux';
import { closeFeedback, saveFeedback } from '../board.reducer';

interface Feedback {}

const Feedback: React.FC<Feedback> = (props) => {
  const dispatch = useDispatch();
  const isOpen = useSelector((s) => s.board.isFeedbackOpen);
  const placeholderText = `We appreciate the feedback. Thank you.`;

  const ref = useRef<HTMLTextAreaElement | null>(null);
  const [isSubmitPressed, setIsSubmitPressed] = useState(false);
  const [numRows, setNumRows] = useState(5);

  useEffect(() => {
    if (isOpen && ref.current) {
      ref.current.focus();
    }
  }, [isOpen]);

  function onKeyUp(e: React.KeyboardEvent) {
    if (ref.current) {
      const numLines = ref.current.value.split('\n').length;
      setNumRows(Math.max(5, numLines + 1));
    }
  }

  function submit(e: React.MouseEvent) {
    if (!ref.current) return;
    const text = ref.current.value;
    dispatch(saveFeedback(text));

    ref.current.value = '';
    dispatch(closeFeedback());
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          backgroundColor: COLORS.feedbackBg,
          padding: '10px',
          borderRadius: '4px',
          fontSize: '14px',
          boxShadow: `0px 4px 2px -2px ${COLORS.dropShadow}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1',
            border: 'none',
            zIndex: 100,
          }}
        >
          <textarea
            onKeyUp={(e) => onKeyUp(e)}
            ref={ref}
            name="feedback"
            id="feedback"
            rows={numRows}
            placeholder={placeholderText}
            style={{
              border: 'none',
              resize: 'none',
              height: 'auto',
            }}
          ></textarea>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            <button
              onClick={(e) => submit(e)}
              onPointerDown={() => setIsSubmitPressed(true)}
              onPointerLeave={() => setIsSubmitPressed(false)}
              style={{
                float: 'right',
                padding: '.5625rem 1rem',
                fontSize: '1rem',
                lineHeight: 1,
                borderRadius: '.375rem',
                maxWidth: '125px',
                border: 'none',
                textAlign: 'center',
                verticalAlign: 'middle',
                fontWeight: 600,
                boxShadow: isSubmitPressed
                  ? ''
                  : `0px 4px 2px -2px ${COLORS.dropShadow}`,
                color: COLORS.feedbackBg,
                backgroundColor: COLORS.feedbackSubmit,
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      <div
        onClick={(e) => dispatch(closeFeedback())}
        id="feedback-modal-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '100vw',
          zIndex: 50,
        }}
      ></div>
    </>
  );
};

export default Feedback;
