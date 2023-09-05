import { useAppSelector } from '~/lib/react-redux';
import { type AuthState } from '~/features/auth/authSlice';
import { ExhaustiveError } from '~/utils/assert';
import MFASolutionList from './MFASolutionList';
import CODESender from './mfasolution/CODESender';
import EmailAndPassSender from './mfasolution/EmailAndPassSender';
import TOTPSender from './mfasolution/TOTPSender';

export default function SolutionSelector() {
  const loginStatus = useAppSelector<AuthState['loginStatus']>(
    (state) => state.auth.loginStatus,
  );
  switch (loginStatus.step) {
    case 'EmailAndPass':
      return <EmailAndPassSender state={loginStatus.state} />;
    case 'TOTP':
      return <TOTPSender state={loginStatus.state} />;
    case 'CODE':
      return <CODESender state={loginStatus.state} />;
    case 'FIDO2':
    case 'SelectMFASolution':
      return <MFASolutionList />;
    case 'EMAIL':
      return <></>;
    default:
      throw new ExhaustiveError(loginStatus);
      return <></>;
  }
}
