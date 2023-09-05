import { type ReactNode } from 'react';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import { useAppDispatch, useAppSelector } from '~/lib/react-redux';
import type {
  FileInfoFile,
  FileInfoFolder,
  FileNode,
} from '~/features/file/file.type';
import {
  changeActiveFileGroupDir,
  createDiffAsync,
  filedownloadAsync,
} from '~/features/file/fileSlice';
import {
  exportFileInfo,
  exportFolderInfo,
} from '~/features/file/util/exportinfo';
import genZipFile from '~/features/file/util/zip';
import { ExhaustiveError } from '~/utils/assert';
import { string2ByteArray } from '~/utils/uint8';
import ContextMenuWrapper from '../atom/ContextMenuWrapper';
import type { ContextMenuProps } from '../util';
import { downloadLocal } from '../util';

export type ContextMenuFileListItem = {
  type: 'filelistitem';
  target: FileNode<FileInfoFile | FileInfoFolder>;
  isInDir?: boolean;
  selected?: boolean;
};

export default function MenuFileListItem(
  props: ContextMenuProps<ContextMenuFileListItem>,
) {
  const { menu, genHandleContextMenu } = props;

  const dispatch = useAppDispatch();
  const fileState = useAppSelector((state) => state.file);
  const { activeFileGroup } = fileState;

  const { target } = menu;
  const isInDir =
    menu.isInDir !== false
      ? activeFileGroup && activeFileGroup.type === 'dir'
      : false;

  const result: ReactNode[] = [];

  if (menu.selected && activeFileGroup) {
    // (All Item) Add Bin or Restore From Bin
    const handleMenuAllAddBin = genHandleContextMenu(() => {
      if (activeFileGroup) {
        activeFileGroup.selecting.forEach((id) => {
          const bintarget = fileState.fileTable[id];
          // console.log(id, bintarget);
          if (
            (bintarget.type === 'file' || bintarget.type === 'folder') &&
            !bintarget.tag.includes('bin')
          ) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            dispatch(
              createDiffAsync({ targetId: id, newTags: { addtag: ['bin'] } }),
            );
          }
        });
      }
    });
    const handleMenuAllRestoreFromBin = genHandleContextMenu(() => {
      if (activeFileGroup) {
        activeFileGroup.selecting.forEach((id) => {
          const bintarget = fileState.fileTable[id];
          // console.log(id, bintarget);
          if (
            (bintarget.type === 'file' || bintarget.type === 'folder') &&
            bintarget.tag.includes('bin')
          ) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            dispatch(
              createDiffAsync({ targetId: id, newTags: { deltag: ['bin'] } }),
            );
          }
        });
      }
    });
    const [haveBinItem, haveNotBinItem] = activeFileGroup.selecting.reduce(
      (acc, value) => {
        const selectItem = fileState.fileTable[value];
        if (
          (acc[0] && acc[1]) ||
          !(selectItem.type === 'file' || selectItem.type === 'folder')
        )
          return acc;
        if (selectItem.tag.includes('bin')) return [true, acc[1]];
        return [acc[0], true];
      },
      [false, false],
    );
    if (haveNotBinItem)
      result.push(
        <MenuItem key='menuAllAddBin' onClick={handleMenuAllAddBin}>
          すべてゴミ箱に追加
        </MenuItem>,
      );
    if (haveBinItem)
      result.push(
        <MenuItem
          key='menuAllRestoreFromBin'
          onClick={handleMenuAllRestoreFromBin}
        >
          すべてゴミ箱から復元
        </MenuItem>,
      );
    result.push(<Divider key='anyfileDivider' />);
  }

  // Show Dir

  const handleMenuShowDir = genHandleContextMenu(() => {
    if (target.parentId)
      dispatch(changeActiveFileGroupDir({ id: target.parentId }));
  });
  if (!isInDir)
    result.push(
      <MenuItem key='menuShowDir' onClick={handleMenuShowDir}>
        ファイルの場所を表示
      </MenuItem>,
    );

  if (target.type === 'file') {
    // Show or DL

    const handleMenuDecrypto = genHandleContextMenu(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dispatch(filedownloadAsync({ fileId: target.id, active: true }));
    });
    if (target.blobURL)
      result.push(
        <MenuItem
          key='menuDownload'
          component={Link}
          download={target.name}
          href={target.blobURL}
        >
          ダウンロード
        </MenuItem>,
      );
    else
      result.push(
        <MenuItem key='menuDecrypto' onClick={handleMenuDecrypto}>
          ファイルを復号して表示
        </MenuItem>,
      );
  } else if (target.type === 'folder') {
    const handleDirDownload = genHandleContextMenu(async () => {
      const zipblob = genZipFile(target, fileState.fileTable);
      const metadataURI = URL.createObjectURL(await zipblob);

      downloadLocal({ uri: metadataURI, fileName: `${target.name}.zip` });

      URL.revokeObjectURL(metadataURI);
    });
    result.push(
      <MenuItem key='menuDirDownload' onClick={handleDirDownload}>
        ダウンロード
      </MenuItem>,
    );
  }
  // ADD Bin or Restore From Bin

  const handleMenuAddBin = genHandleContextMenu(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(
      createDiffAsync({ targetId: target.id, newTags: [...target.tag, 'bin'] }),
    );
  });
  const handleMenuRestoreFromBin = genHandleContextMenu(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(
      createDiffAsync({
        targetId: target.id,
        newTags: target.tag.filter((x) => x !== 'bin'),
      }),
    );
  });
  if (target.tag.includes('bin'))
    result.push(
      <MenuItem key='menuRestoreFromBin' onClick={handleMenuRestoreFromBin}>
        ゴミ箱から復元
      </MenuItem>,
    );
  else
    result.push(
      <MenuItem key='menuAddBin' onClick={handleMenuAddBin}>
        ゴミ箱に追加
      </MenuItem>,
    );

  // download meta data
  const handleMenuDLInfo = genHandleContextMenu(() => {
    const metadata =
      target.type === 'file'
        ? exportFileInfo(target)
        : target.type === 'folder'
        ? exportFolderInfo(target, fileState.fileTable)
        : (() => {
            throw new ExhaustiveError(target);
          })();
    const metadataURI = URL.createObjectURL(
      new Blob([string2ByteArray(JSON.stringify(metadata))], {
        type: 'application/json',
      }),
    );

    downloadLocal({ uri: metadataURI, fileName: `${target.name}.meta.json` });

    URL.revokeObjectURL(metadataURI);
  });
  result.push(
    <MenuItem key='menuDLInfo' onClick={handleMenuDLInfo}>
      メタデータをダウンロード
    </MenuItem>,
  );
  return <ContextMenuWrapper>{result}</ContextMenuWrapper>;
}
