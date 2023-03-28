import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '~/lib/react-redux';

// ログインしていない時・管理者でない時ログイン画面へ遷移
export default function RequireAuth({ children }: { children: JSX.Element }) {
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();
  if (user === null || user.authority !== 'ADMIN') return <Navigate to="/" state={{ from: location }} />;
  return children;
}
