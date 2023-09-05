import { useState } from 'react';
import EditOffIcon from '@mui/icons-material/EditOff';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Unstable_Grid2';
import TagEditor from './TagEditor';
import TagList from './TagList';

function TagField() {
  const [editMode, setEditMode] = useState(false);
  return (
    <Grid container spacing={1} height={60} justifyContent='center'>
      <Grid>
        <IconButton onClick={() => setEditMode((beforeMode) => !beforeMode)}>
          {editMode ? <EditOffIcon /> : <ModeEditIcon />}
        </IconButton>
      </Grid>
      <Grid xs>{editMode ? <TagEditor /> : <TagList />}</Grid>
    </Grid>
  );
}

export default TagField;
