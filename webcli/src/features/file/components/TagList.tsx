import Box from '@mui/material/Box';
import { useAppSelector } from '../../../app/hooks';
import type { FileState } from '../fileSlice';
import { assertFileNodeFile } from '../filetypeAssert';
import TagButton from './TagButton';

function TagList() {
  const { activeFile, fileTable } = useAppSelector<FileState>((state) => state.file);
  if (!activeFile) return null;
  const targetNode = fileTable[activeFile.fileId];
  assertFileNodeFile(targetNode);

  return <Box margin={2}>{targetNode.tag.map((x) => <TagButton key={x} tag={x} />)}</Box>;
}

export default TagList;
