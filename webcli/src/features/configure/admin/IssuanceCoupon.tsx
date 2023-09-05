import { useState, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { issuanceCoupon } from './adminrequest';

type CouponState = { coupon: string[]; isLoading: boolean };
const initialState: CouponState = { coupon: [], isLoading: false };

type CouponAction = string[] | 'loading';

const couponReducerFunc = (
  couponState: CouponState,
  action: CouponAction,
): CouponState =>
  action === 'loading'
    ? { ...couponState, isLoading: true }
    : { coupon: [...couponState.coupon, ...action], isLoading: false };

export default function BasicCard() {
  const [numOfCoupon, setNumOfCoupon] = useState(1);
  const { t } = useTranslation();
  const [couponState, dispatch] = useReducer(couponReducerFunc, initialState);
  const handleIssue = async () => {
    dispatch('loading');
    dispatch(await issuanceCoupon(numOfCoupon));
  };
  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography variant='h5' component='div'>
          {t('admin.IssueCoupon', 'クーポンを発行')}
        </Typography>

        <TextField
          type='number'
          value={numOfCoupon}
          onChange={(e) => {
            setNumOfCoupon(parseInt(e.target.value, 10));
          }}
          InputProps={{
            inputProps: {
              min: 1,
            },
          }}
        />
        <List
          sx={{
            width: '100%',
            maxWidth: 360,
            bgcolor: 'background.paper',
            position: 'relative',
            overflow: 'auto',
            maxHeight: 300,
          }}
        >
          {couponState.coupon.map((couponId) => (
            <ListItem key={couponId}>
              <ListItemText primary={couponId} />
            </ListItem>
          ))}
        </List>
      </CardContent>
      <CardActions>
        <Button size='small' onClick={handleIssue}>
          {t('admin.issue', '発行')}
        </Button>
      </CardActions>
    </Card>
  );
}
