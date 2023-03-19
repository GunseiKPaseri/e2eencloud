import TFAList from '../../features/auth/components/TFAList';
import PasswordChanger from '../../features/auth/components/PasswordChanger';
import TwoFactorAuth from '../../features/auth/components/TwoFactorAuth';
import { useAppSelector } from '../../app/hooks';
import SessionConfig from '../../features/session/sessionConfing';
import UserList from '../admin/UserList';
import StorageInfo from '../../features/file/components/StorageInfo';
import HookList from './HookList';
import IssuanceCoupon from '../admin/IssuanceCoupon';
import UseCoupon from './UseCoupon';
import FIDO2Register from '../../features/auth/components/FIDO2Register';

export default function ConfigurePage() {
  const user = useAppSelector((state) => state.auth.user);
  return (
    <>
      { user
        && (
        <>
          <SessionConfig />
          <UseCoupon />
          <StorageInfo />
          <TFAList />
          <TwoFactorAuth />
          <FIDO2Register />
          <PasswordChanger />
          <HookList />
        </>
        )}
      {
        user && user.authority === 'ADMIN'
        && (
        <>
          <UserList />
          <IssuanceCoupon />
        </>
        )
      }
    </>
  );
}
