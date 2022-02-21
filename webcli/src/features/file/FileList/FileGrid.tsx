import React from 'react';

import { SxProps, Theme } from '@mui/material/styles';

import { DataGrid, GridRenderCellParams, GridRowsProp, jaJP } from '@mui/x-data-grid'

import { useAppSelector } from '../../../app/hooks';
import { FileState } from '../fileSlice';
import { assertNonFileNodeDiff } from '../filetypeAssert';
import { TagButton } from '../TagButton';


export const FileGrid = (props: {sx?: SxProps<Theme>, nodeRef?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>['ref'], onSelectFolder: (id:string) => void, onSelectFile: (id: string) => void}) => {
  const {sx, nodeRef, onSelectFile, onSelectFolder} = props
  const { fileTable, activeFileGroup } = useAppSelector<FileState>(state => state.file)

  return (activeFileGroup
    ? <div style={{ height: 300, width: '100%' }} ref={nodeRef}>
        <DataGrid sx={sx}
          localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
          editMode="row"
          rows={
            activeFileGroup.files.map<GridRowsProp[number]>(x => {
              const target = fileTable[x]
              assertNonFileNodeDiff(target)
              return target.type === 'folder'
                ? { id: target.id, name: target.name, mime: '', size: -1, tags: null }
                : { id: target.id, name: target.name, mime: target.mime, size: target.size, tags: target.tag.join('|||') }
            })
          }
          columns={[
            { field: 'id', hide: true },
            { field: 'name', headerName: '名前', width: 200 },
            { field: 'mime', headerName: 'MIMEタイプ', width: 200 },
            { field: 'size', headerName: 'ファイルサイズ', type: 'number', width: 200 },
            {
              field: 'tags',
              headerName: 'タグ',
              width: 600,
              renderCell: (params: GridRenderCellParams<string>) =>
                (params.value
                  ? params.value.split('|||').map(x => (<TagButton key={x} tag={x} />))
                  : <></>)
            }
          ]} />
      </div>
    : <></>)
}