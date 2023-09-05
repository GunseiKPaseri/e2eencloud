import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '~/lib/react-redux';

// ログインしていない時ログイン画面へ遷移
export default function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();
  if (user === null) return <Navigate to='/' state={{ from: location }} />;
  return children;
}
