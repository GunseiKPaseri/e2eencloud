import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import type { FormEvent } from 'react';

interface SendedEmailProps {
  timer: number;
  email: string;
  onCancel: () => void;
  onResend: () => void;
}

export default function SendedEmail(props: SendedEmailProps) {
  const {
    timer, email, onCancel, onResend,
  } = props;
  return (
    <Box
      component="form"
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onResend();
      }}
      noValidate
      sx={{ mt: 1 }}
    >
      <Typography component="p">
        <Typography component="em">{email}</Typography>
        にメールを送信しました。受信したメールに含まれる確認リンクにアクセスしてください。
      </Typography>
      <ul>
        <li>メールアドレスが間違っていませんか？</li>
        <li>迷惑メールに含まれていませんか？</li>
        <li>既に登録済みではありませんか？</li>
      </ul>
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
            disabled={timer !== 0}
          >
            再送信
            {(timer > 0 ? `(${timer})` : '')}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
