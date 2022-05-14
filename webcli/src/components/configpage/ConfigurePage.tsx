import PasswordChanger from '../../features/auth/PasswordChanger';
import TwoFactorAuth from '../../features/auth/TwoFactorAuth';
import { useAppSelector } from '../../app/hooks';
import SessionConfig from '../../features/session/sessionConfing';
import Userlist from '../admin/Userlist';
import StorageInfo from '../../features/file/components/StorageInfo';

export default function ConfigurePage() {
  const user = useAppSelector((state) => state.auth.user);
  return (
    <>
      { user
        && (
        <>
          <SessionConfig />
          <StorageInfo />
          <TwoFactorAuth />
          <PasswordChanger />
        </>
        )}
      {user && user.authority === 'ADMIN' && <Userlist />}
    </>
  );
}
