import Box from '@mui/material/Box';
import { useAppSelector } from '~/lib/react-redux';
import type { FileState } from '~/features/file/fileSlice';
import { assertFileNodeFile } from '~/features/file/filetypeAssert';
import TagButton from '../atom/TagButton';

function TagList() {
  const { activeFile, fileTable } = useAppSelector<FileState>(
    (state) => state.file,
  );
  if (!activeFile) return null;
  const targetNode = fileTable[activeFile.fileId];
  assertFileNodeFile(targetNode);

  return (
    <Box margin={2}>
      {targetNode.tag.map((x) => (
        <TagButton key={x} tag={x} />
      ))}
    </Box>
  );
}

export default TagList;
