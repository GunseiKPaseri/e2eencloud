import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useAppSelector } from '~/lib/react-redux';
import type { FileState } from '../../fileSlice';
import { assertFileNodeFileORUndefined } from '../../filetypeAssert';
import { explainByte } from '../../utils';

function Detail() {
  const fileState = useAppSelector<FileState>((store) => store.file);
  const { activeFile } = fileState;
  const activeNode = activeFile
    ? fileState.fileTable[activeFile.fileId]
    : undefined;
  assertFileNodeFileORUndefined(activeNode);
  return activeNode && activeFile ? (
    <TableContainer component={Paper}>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>項目</strong>
            </TableCell>
            <TableCell>
              <strong>情報</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>ファイル名</TableCell>
            <TableCell>{activeNode.name}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>MIME</TableCell>
            <TableCell>{activeNode.mime}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>ファイルサイズ</TableCell>
            <TableCell>{`${explainByte(activeNode.size)} (${
              activeNode.size
            }B)`}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>SHA256</TableCell>
            <TableCell>{activeNode.sha256}</TableCell>
          </TableRow>
          {activeNode.expansion && activeNode.expansion.type === 'img' ? (
            <>
              <TableRow>
                <TableCell>size</TableCell>
                <TableCell>{`${activeNode.expansion.width} x ${activeNode.expansion.height}`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>ahash</TableCell>
                <TableCell>{activeNode.expansion.ahash}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>dhash</TableCell>
                <TableCell>{activeNode.expansion.dhash}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>phash</TableCell>
                <TableCell>{activeNode.expansion.phash}</TableCell>
              </TableRow>
            </>
          ) : (
            <></>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <></>
  );
}

export default Detail;
