import React from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'global/redux';
import { clearErrors } from './errors.reducer';

interface ToastContent {
  message: string;
}

const Toast: React.FC<ToastContent> = (props) => {
  const dispatch = useDispatch();
  return (
    <div
      style={{
        backgroundColor: 'rgba(208, 0, 0, 0.05)',
        border: '1px solid rgb(208, 0, 0)',
        boxShadow: 'rgb(208, 0, 0) 0px 4px 2px -2px',
        width: '200px',
        borderRadius: '20px',
        minHeight: '30px',
        paddingLeft: '10px',
        paddingRight: '10px',
        paddingBottom: '20px',
        margin: '5px 0px',
        fontSize: 'small',
      }}
    >
      <div
        style={{
          display: 'flex',
          paddingRight: '5px',
          paddingBottom: '5px',
          justifyContent: 'flex-end',
          pointerEvents: 'all',
        }}
      >
        <p onClick={(e) => dispatch(clearErrors())}>x</p>
      </div>
      <span>{props.message}</span>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const errors = useSelector((s) => s.errors);

  return (
    <div style={{ display: 'flex', flexFlow: 'column nowrap' }}>
      {errors.data.map((e, i) => (
        <Toast key={i} message={e.message}></Toast>
      ))}
    </div>
  );
};

export default ToastContainer;
