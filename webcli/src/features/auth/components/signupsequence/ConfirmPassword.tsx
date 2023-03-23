import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import type { FormEvent } from 'react';
import PasswordField from '~/features/auth/components/PasswordField';

interface PutPasswordProps {
  password: string;
  confirmPassword: string;
  onChangeConfirmPassword: (confirmPassword: string) => void;
  onCancel: () => void;
  onDecidePassword: () => void;
}

export default function PutPassword(props: PutPasswordProps) {
  const {
    password, confirmPassword, onChangeConfirmPassword, onCancel, onDecidePassword,
  } = props;
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
        label="パスワード（確認のため再入力）"
        id="password"
        autoComplete="current-password"
        value={confirmPassword}
        onChange={(e) => onChangeConfirmPassword(e.target.value)}
        helperText="先程入力したものと同じものを入力してください"
      />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Button
            type="button"
            fullWidth
            variant="outlined"
            sx={{ mt: 3, mb: 2 }}
            onClick={onCancel}
          >
            戻る
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={password !== confirmPassword}
            onClick={onDecidePassword}
          >
            登録
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
