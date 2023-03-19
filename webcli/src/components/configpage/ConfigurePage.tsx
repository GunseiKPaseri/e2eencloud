import MFAList from '../../features/auth/components/MFAList';
import PasswordChanger from '../../features/auth/components/PasswordChanger';
import MultiFactorAuth from '../../features/auth/components/MultiFactorAuth';
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
          <MFAList />
          <MultiFactorAuth />
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
