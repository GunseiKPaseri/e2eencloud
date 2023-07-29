import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import EmailIcon from '@mui/icons-material/Email';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import PasswordIcon from '@mui/icons-material/Password';
import LockClockIcon from '@mui/icons-material/LockClock';
import { useAppDispatch, useAppSelector } from '~/lib/react-redux';
import { ExhaustiveError } from '~/utils/assert';
import { type AuthState, selectMFASolution, mfaCancelAsync } from '~/features/auth/authSlice';
import { mfasolution2name } from '~/features/auth/solution';
import { fido2LoginAsync } from '~/features/auth/thunk/fido2LoginAsync';

function MFASolutionLogo({ solution }: { solution: AuthState['suggestedMfa'][0] }) {
  switch (solution) {
    case 'TOTP':
      return <LockClockIcon />;
    case 'CODE':
      return <PasswordIcon />;
    case 'FIDO2':
      return <FingerprintIcon />;
    case 'EMAIL':
      return <EmailIcon />;
    default:
      throw new ExhaustiveError(solution);
  }
}

export default function MFASolutionList() {
  const suggestedMFA = useAppSelector<AuthState['suggestedMfa']>((state) => state.auth.suggestedMfa);
  const dispatch = useAppDispatch();

  return (
    <Box sx={{ mt: 1 }}>
      <Typography>二要素認証の選択</Typography>
      {
        suggestedMFA.map((x) => (
          <Button
            key={x}
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            startIcon={<MFASolutionLogo solution={x} />}
            onClick={async () => {
              if (x === 'FIDO2') {
                await dispatch(fido2LoginAsync({ auto: false }));
              } else {
                dispatch(selectMFASolution(x));
              }
            }}
          >
            {mfasolution2name(x)}
          </Button>
        ))
      }
      <Button
        key="logout"
        fullWidth
        sx={{ mt: 3, mb: 2 }}
        onClick={async () => {
          await dispatch(mfaCancelAsync());
        }}
      >
        キャンセル
      </Button>
    </Box>
  );
}
