import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import type { ChangeEvent, FormEvent } from 'react';
import { z } from 'zod';

// <PutEmail email={email} onChange={(e) => setEmail(e.target.value)} />

const emailSchema = z.string().email();

interface PutEmailProps {
  timer: number;
  email: string;
  onChangeEmail: (email: string) => void;
  onConfirm: () => void;
}

export default function PutEmail(props: PutEmailProps) {
  const {
    timer, onConfirm, email, onChangeEmail,
  } = props;
  const isGoodMailAddress = emailSchema.safeParse(email).success;
  return (
    <Box
      component="form"
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onConfirm();
      }}
      noValidate
      sx={{ mt: 1 }}
    >
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="メールアドレス"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        error={!isGoodMailAddress}
        helperText={isGoodMailAddress ? '' : '正しくないメールアドレスです'}
        onChange={
          (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => (
            onChangeEmail(e.target.value)
          )
        }
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={!isGoodMailAddress}
      >
        次へ
        {(timer > 0 ? `(${timer})` : '')}
      </Button>
    </Box>
  );
}
