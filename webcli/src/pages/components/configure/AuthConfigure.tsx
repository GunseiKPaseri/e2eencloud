import MFASetting from '~/features/auth/components/MFASetting';
import PasswordChanger from '~/features/auth/components/PasswordChanger';
import SessionConfig from '~/features/session/sessionConfing';

export default function AuthConfigure() {
  return (
    <>
      <SessionConfig />
      <MFASetting />
      <PasswordChanger />
    </>
  );
}
