import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import { Typography } from '@mui/material';
import { useAppSelector } from '../../app/hooks';
import { explainByte } from './utils';

function StorageInfo() {
  const user = useAppSelector((state) => state.auth.user);
  const storage = useAppSelector((state) => state.file.storage);
  const percentage = storage.capacity > 0 ? (storage.usage / storage.capacity) * 100 : 0;
  return (
    <Card>
      <CardHeader
        title="容量"
        subheader={user ? user.email : ''}
      />
      <CardContent>
        <LinearProgress variant="determinate" value={percentage} color={(percentage > 95 ? 'error' : (percentage > 80 ? 'warning' : 'info'))} />
        <Typography>{`${explainByte(storage.usage)} / ${explainByte(storage.capacity)}`}</Typography>
        <Typography>{`残り${explainByte(storage.capacity - storage.usage)}`}</Typography>
      </CardContent>
    </Card>
  );
}

export default StorageInfo;
