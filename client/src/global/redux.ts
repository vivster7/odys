import { useSelector as reduxUseSelector } from 'react-redux';
import { RootState } from 'App';
import { SerializedError } from '@reduxjs/toolkit';

export type ActionPending<T = void> = {
  type: string;
  payload: undefined;
  meta: { requestId: string; arg: T };
};
export type ActionFulfilled<T = void, S = void> = {
  type: string;
  payload: S;
  meta: { requestId: string; arg: T };
};
export type ActionRejected<T = void> = {
  type: string;
  payload: undefined;
  error: SerializedError | any;
  meta: { requestId: string; arg: T };
};

// wrap redux's useSelector with our typing information (specifically RootState)
export function useSelector<TSelected = unknown>(
  selector: (state: RootState) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
) {
  return reduxUseSelector<RootState, TSelected>(selector, equalityFn);
}
