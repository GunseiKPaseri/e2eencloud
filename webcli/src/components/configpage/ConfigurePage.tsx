import PasswordChanger from '../../features/auth/components/PasswordChanger';
import TwoFactorAuth from '../../features/auth/components/TwoFactorAuth';
import { useAppSelector } from '../../app/hooks';
import SessionConfig from '../../features/session/sessionConfing';
import Userlist from '../admin/Userlist';
import StorageInfo from '../../features/file/components/StorageInfo';
import HookList from './HookList';

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
          <HookList />
        </>
        )}
      {user && user.authority === 'ADMIN' && <Userlist />}
    </>
  );
}
