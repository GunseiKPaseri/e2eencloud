import { Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from '@mui/material/Grid';

export default function AppFallback(props?: { minHeight?: string | number }) {
  const { minHeight = '100vh'} = props ?? {};
  return (
    <Grid container alignItems='center' justifyContent='center' direction='column' sx={{ minHeight }}>
      <Grid item xs={12}>
        <CircularProgress />
      </Grid>
      <Grid item xs={12}>
        <Typography>Now loading...</Typography>
      </Grid>
    </Grid>
  )
}
