import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import type { FormEvent } from 'react';
import { useState } from 'react';
import zxcvbn from 'zxcvbn';
import PasswordChecker from '~/features/auth/components/PasswordChecker';
import PasswordField from '~/features/auth/components/PasswordField';

interface PutPasswordProps {
  password: string;
  onChangePassword: (password: string) => void;
  onDecidePassword: () => void;
}

export default function PutPassword(props: PutPasswordProps) {
  const {
    password, onChangePassword, onDecidePassword,
  } = props;
  const [changed, setChanged] = useState(false);
  const res = zxcvbn(password, []);
  const passwordScore:0 | 1 | 2 | 3 | 4 = password.length < 8 ? 0 : res.score;
  return (
    <Box
      component="form"
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onDecidePassword();
      }}
      noValidate
      sx={{ mt: 1 }}
    >
      <PasswordField
        margin="normal"
        required
        fullWidth
        name="password"
        label="パスワード"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => {
          setChanged(true);
          onChangePassword(e.target.value);
        }}
        error={changed && passwordScore < 2}
        helperText={changed ? <PasswordChecker score={passwordScore} /> : <></>}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={passwordScore < 2}
      >
        次へ
      </Button>
    </Box>
  );
}
