
import { SideMenu } from './components/sidemenu/SideMenu'

import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { FileExplorer } from './components/fileexplorer/FileExplorer'

function App () {
  const theme = useTheme()
  return (
    <Box sx={{ display: 'flex' }}>
      <SideMenu/>
      <Box
        component="main"
        sx={{
          paddingTop: 8,
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          height: '100vh'
        }}
      >
        <FileExplorer />
      </Box>
    </Box>
  )
}

export default App
