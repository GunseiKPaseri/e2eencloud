import IssuanceCoupon from '~/features/configure/admin/IssuanceCoupon';
import UserList from '~/features/configure/admin/UserList';

export default function AdminConfigure() {
  return (
    <>
      <UserList />
      <IssuanceCoupon />
    </>
  );
}
