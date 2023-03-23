import { useAppSelector } from '~/lib/react-redux';
import PasswordChanger from '~/features/auth/components/PasswordChanger';
import SessionConfig from '~/features/session/sessionConfing';
import UserList from '~/features/configure/admin/UserList';
import StorageInfo from '~/features/file/components/StorageInfo';
import HookList from '~/features/configure/everyone/HookList';
import IssuanceCoupon from '~/features/configure/admin/IssuanceCoupon';
import UseCoupon from '~/features/configure/everyone/UseCoupon';
import MFASetting from '~/features/auth/components/MFASetting';

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
