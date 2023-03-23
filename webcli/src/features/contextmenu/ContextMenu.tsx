import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Link from '@mui/material/Link';
import React from 'react';
import Divider from '@mui/material/Divider';
import { useAppSelector, useAppDispatch } from '~/lib/react-redux';
import { changeActiveFileGroupDir, createDiffAsync, filedownloadAsync } from '~/features/file/fileSlice';
import { string2ByteArray } from '~/utils/uint8';
import { ExhaustiveError } from '~/utils/assert';
import { exportFileInfo, exportFolderInfo } from '~/features/file/util/exportinfo';
import genZipFile from '~/features/file/util/zip';
import { closeContextmenu } from './contextmenuSlice';

function ContextMenu() {
  const menuState = useAppSelector((store) => store.contextmenu.menuState);
  const fileState = useAppSelector((state) => state.file);
  const { activeFileGroup } = fileState;

  const dispatch = useAppDispatch();
  const handleClose = () => dispatch(closeContextmenu());

  const result: JSX.Element[] = [];

  if (menuState !== null) {
    if (menuState.menu.type === 'filelistitemfile') {
      const { target } = menuState.menu;
      const isInDir = menuState.menu.isInDir !== false ? (activeFileGroup && activeFileGroup.type === 'dir') : false;

      if (menuState.menu.selected && activeFileGroup) {
        // (All Item) Add Bin or Restore From Bin
        const handleMenuAllAddBin = () => {
          if (activeFileGroup) {
            activeFileGroup.selecting.forEach((id) => {
              const bintarget = fileState.fileTable[id];
              // console.log(id, bintarget);
              if ((bintarget.type === 'file' || bintarget.type === 'folder') && !bintarget.tag.includes('bin')) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                dispatch(createDiffAsync({ targetId: id, newTags: { addtag: ['bin'] } }));
              }
            });
          }
          dispatch(closeContextmenu());
        };
        const handleMenuAllRestoreFromBin = () => {
          if (activeFileGroup) {
            activeFileGroup.selecting.forEach((id) => {
              const bintarget = fileState.fileTable[id];
              // console.log(id, bintarget);
              if ((bintarget.type === 'file' || bintarget.type === 'folder') && bintarget.tag.includes('bin')) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                dispatch(createDiffAsync({ targetId: id, newTags: { deltag: ['bin'] } }));
              }
            });
          }
          dispatch(closeContextmenu());
        };
        const [haveBinItem, haveNotBinItem] = activeFileGroup.selecting.reduce((acc, value) => {
          const selectItem = fileState.fileTable[value];
          if ((acc[0] && acc[1]) || !(selectItem.type === 'file' || selectItem.type === 'folder')) return acc;
          if (selectItem.tag.includes('bin')) return [true, acc[1]];
          return [acc[0], true];
        }, [false, false]);
        if (haveNotBinItem) result.push(<MenuItem key="menuAllAddBin" onClick={handleMenuAllAddBin}>すべてゴミ箱に追加</MenuItem>);
        if (haveBinItem) result.push(<MenuItem key="menuAllRestoreFromBin" onClick={handleMenuAllRestoreFromBin}>すべてゴミ箱から復元</MenuItem>);
        result.push(<Divider key="anyfileDivider" />);
      }

      // Show Dir

      const handleMenuShowDir = () => {
        if (target.parentId) dispatch(changeActiveFileGroupDir({ id: target.parentId }));
        dispatch(closeContextmenu());
      };
      if (!isInDir) result.push(<MenuItem key="menuShowDir" onClick={handleMenuShowDir}>ファイルの場所を表示</MenuItem>);

      if (target.type === 'file') {
        // Show or DL

        const handleMenuDecrypto = () => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          dispatch(filedownloadAsync({ fileId: target.id, active: true }));
          dispatch(closeContextmenu());
        };
        if (target.blobURL) result.push(<MenuItem key="menuDownload" component={Link} download={target.name} href={target.blobURL}>ダウンロード</MenuItem>);
        else result.push(<MenuItem key="menuDecrypto" onClick={handleMenuDecrypto}>ファイルを復号して表示</MenuItem>);
      } else if (target.type === 'folder') {
        const handleDirDownload = async () => {
          const zipblob = genZipFile(target, fileState.fileTable);
          const metadataURI = URL.createObjectURL(await zipblob);

          // Download
          const a = document.createElement('a');
          a.href = metadataURI;
          a.download = `${target.name}.zip`;
          document.body.appendChild(a);

          a.click();

          a.parentNode?.removeChild(a);

          URL.revokeObjectURL(metadataURI);
          dispatch(closeContextmenu());
        };
        result.push(<MenuItem key="menuDirDownload" onClick={handleDirDownload}>ダウンロード</MenuItem>);
      }
      // ADD Bin or Restore From Bin

      const handleMenuAddBin = () => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        dispatch(createDiffAsync({ targetId: target.id, newTags: [...target.tag, 'bin'] }));
        dispatch(closeContextmenu());
      };
      const handleMenuRestoreFromBin = () => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        dispatch(createDiffAsync({ targetId: target.id, newTags: target.tag.filter((x) => x !== 'bin') }));
        dispatch(closeContextmenu());
      };
      if (target.tag.includes('bin')) result.push(<MenuItem key="menuRestoreFromBin" onClick={handleMenuRestoreFromBin}>ゴミ箱から復元</MenuItem>);
      else result.push(<MenuItem key="menuAddBin" onClick={handleMenuAddBin}>ゴミ箱に追加</MenuItem>);

      // download meta data
      const handleMenuDLInfo = () => {
        const metadata = target.type === 'file' ? exportFileInfo(target)
          : target.type === 'folder' ? exportFolderInfo(target, fileState.fileTable)
            : (() => { throw new ExhaustiveError(target); })();
        const metadataURI = URL.createObjectURL(new Blob([string2ByteArray(JSON.stringify(metadata))], { type: 'application/json' }));

        // Download
        const a = document.createElement('a');
        a.href = metadataURI;
        a.download = `${target.name}.meta.json`;
        document.body.appendChild(a);

        a.click();

        a.parentNode?.removeChild(a);

        URL.revokeObjectURL(metadataURI);
        dispatch(closeContextmenu());
      };
      result.push(<MenuItem key="menuDLInfo" onClick={handleMenuDLInfo}>メタデータをダウンロード</MenuItem>);
    } else {
      throw new ExhaustiveError(menuState.menu.type);
    }
  }

  return (
    <Menu
      open={!!menuState}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={menuState?.anchor}
    >
      {result}
    </Menu>
  );
}

export default function ContextMenuProvider({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <ContextMenu />
    </div>
  );
}
