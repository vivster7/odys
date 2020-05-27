import { useSelector as reduxUseSelector } from 'react-redux';
import { RootState } from 'App';

// wrap redux's useSelector with our typing information (specifically RootState)
export function useSelector<TSelected = unknown>(
  selector: (state: RootState) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
) {
  return reduxUseSelector<RootState, TSelected>(selector, equalityFn);
}
