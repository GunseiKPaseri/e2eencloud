import PasswordChanger from '../../features/auth/components/PasswordChanger';
import { useAppSelector } from '../../app/hooks';
import SessionConfig from '../../features/session/sessionConfing';
import UserList from '../admin/UserList';
import StorageInfo from '../../features/file/components/StorageInfo';
import HookList from './HookList';
import IssuanceCoupon from '../admin/IssuanceCoupon';
import UseCoupon from './UseCoupon';
import MFASetting from '../../features/auth/components/MFASetting';

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
          <MFASetting />
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
