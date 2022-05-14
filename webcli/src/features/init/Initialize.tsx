import type { ReactNode } from 'react';
import { useRef, useEffect } from 'react';
import { useAppDispatch } from '../../app/hooks';
import initAction from './initAction';

export default function Initialize({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const didInitializedRef = useRef(false);
  useEffect(() => {
    if (didInitializedRef.current === false) {
      didInitializedRef.current = true;
      dispatch(initAction());
    }
  }, []);
  return <>{ children }</>;
}
