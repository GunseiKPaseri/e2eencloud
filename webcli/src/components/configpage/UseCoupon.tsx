import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import type { SetStateAction } from 'react';
import { useState } from 'react';
import { bs58CheckDecodeWithoutErr } from '../../utils/bs58check';

import { axiosWithSession } from '../../lib/axios';

import { useAppDispatch } from '../../lib/react-redux';
import { updateUsageAsync } from '../../features/file/fileSlice';
import { enqueueSnackbar } from '../../features/snackbar/snackbarSlice';

const validateId = (couponId: string) => !!bs58CheckDecodeWithoutErr(couponId);

export default function UseCoupon() {
  const [couponId, setCouponId] = useState('');
  const isError = !validateId(couponId);
  const dispatch = useAppDispatch();

  const useCoupon = async (couponid: string) => {
    try {
      const posted = await axiosWithSession.post<{ couponid: string }>(
        '/api/coupons/use',
        { couponid },
      );
      if (posted.status !== 204) throw new Error('');
      await dispatch(updateUsageAsync());
      dispatch(enqueueSnackbar({ message: 'チケットを適用しました', options: { variant: 'success' } }));
      setCouponId('');
    } catch (_) {
      dispatch(enqueueSnackbar({ message: '無効なチケットです', options: { variant: 'error' } }));
    }
  };

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant="h5" component="div">
          クーポンを利用
        </Typography>
        <TextField
          fullWidth
          label="クーポン番号"
          placeholder="XXXXXXXXXXXXXXX"
          error={isError && couponId !== ''}
          onChange={(e: { target: { value: SetStateAction<string>; }; }) => {
            setCouponId(e.target.value);
          }}
        />
      </CardContent>
      <CardActions>
        <Button
          size="small"
          disabled={isError}
          onClick={async () => {
            await useCoupon(couponId);
          }}
        >
          適用
        </Button>
      </CardActions>
    </Card>
  );
}
