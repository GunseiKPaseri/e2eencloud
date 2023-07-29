import ToggleButton from "@mui/material/ToggleButton";
import Tooltip from "@mui/material/Tooltip";
import Link from '@mui/material/Link';

import DownloadIcon from '@mui/icons-material/Download';
import { useAppSelector } from "~/lib/react-redux";
import type { FileState } from "~/features/file/fileSlice";
import { assertFileNodeFileORUndefined } from "~/features/file/filetypeAssert";
import StyledToggleButtonGroup from "~/components/atom/StyledToggleButtonGroup";
import StyledToggleButtonGroupWrapper from "~/components/atom/StyledToggleButtonGroupWrapper";
import FilePreviewRenamerToolbarButton from "./FilePreviewRenamerButton";

export default function FilePreviewToolbar() {
  const fileState = useAppSelector<FileState>((store) => store.file);
  const { activeFile } = fileState;
  const activeNode = activeFile ? fileState.fileTable[activeFile.fileId] : undefined;
  assertFileNodeFileORUndefined(activeNode);
  return (
    <StyledToggleButtonGroupWrapper>
      <StyledToggleButtonGroup size='small' sx={{marginLeft: 1}}>
        <Tooltip title="ダウンロード">
          <ToggleButton
            disabled={activeFile === null}
            component={Link}
            href={activeFile?.link ?? ''}
            download={activeNode?.name}
            value=''
          >
            <DownloadIcon />
          </ToggleButton>
        </Tooltip>
        {
          activeNode !== undefined && <FilePreviewRenamerToolbarButton id={activeNode.id} name={activeNode.name} />
        }
      </StyledToggleButtonGroup>
    </StyledToggleButtonGroupWrapper>
  );
}
