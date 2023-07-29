import type { ReactNode } from 'react';
import { useState, useRef, useEffect } from 'react';
import { useAppDispatch } from '~/lib/react-redux';
import initAction from './initAction';

// 初期化処理を初回ロード時に1度だけ実行
export default function Initialize({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const didInitializedRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    if (didInitializedRef.current === false) {
      didInitializedRef.current = true;
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dispatch(initAction());
      setIsLoaded(true);
    }
  }, []);
  return <>{isLoaded ? children : 'Loaing'}</>;
}
