import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
import SideMenu from './components/sidemenu/SideMenu';

function App() {
  return (
    <Box sx={{ display: 'flex' }}>
      <SideMenu />
      <Box
        component='main'
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh',
          paddingTop: 8,
        }}
      >
        <Box
          sx={{
            height: (theme) => `calc(100vh - ${theme.spacing(8)})`,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default App;
