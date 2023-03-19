import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { addFIDO2Async } from '../authSlice';
import { useAppDispatch } from '../../../app/hooks';

export default function FIDO2Register() {
  const dispatch = useAppDispatch();
  const handleRegister = async () => {
    await dispatch(addFIDO2Async());
  };
  return (
    <Box>
      <Typography variant="h5">FIDO2 WebAuthn</Typography>
      <Button onClick={handleRegister}>
        登録
      </Button>
    </Box>
  );
}
