import HookList from '~/features/configure/everyone/HookList';
import UseCoupon from '~/features/configure/everyone/UseCoupon';
import StorageInfo from '~/features/file/components/StorageInfo';

export default function APIConfigure() {
  return (
    <>
      <UseCoupon />
      <StorageInfo />
      <HookList />
    </>
  );
}
