import React from 'react';

import type { SxProps, Theme } from '@mui/material/styles';

import {
  DataGrid, jaJP,
} from '@mui/x-data-grid';
import type {
  GridRenderCellParams, GridRowsProp, GridSelectionModel,
} from '@mui/x-data-grid';

import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { type FileState, changeSelection } from '../../fileSlice';
import { assertNonFileNodeDiff } from '../../filetypeAssert';
import TagButton from '../TagButton';
import { assertArrayString } from '../../../../utils/assert';

export const serializeTags = (tags: string[]) => tags.map((x) => x.replaceAll('|', '||')).join('|p');

export const deserializeTags = (serialized: string) => serialized.split('|p').map((x) => x.replaceAll('||', '|'));

function FileGrid({
  sx,
  nodeRef,
}: {
  sx?: SxProps<Theme>,
  nodeRef?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>['ref'],
  onSelectFolder: (id:string) => void,
  onSelectFile: (id: string) => void,
}) {
  const { fileTable, activeFileGroup } = useAppSelector<FileState>((state) => state.file);
  const dispatch = useAppDispatch();
  const selectionModel: GridSelectionModel = activeFileGroup?.selecting ?? [];
  // console.log(selectionModel);

  return (activeFileGroup
    && (
      <div style={{ height: 300, width: '100%' }} ref={nodeRef}>
        <DataGrid
          sx={sx}
          localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
          editMode="row"
          checkboxSelection
          selectionModel={selectionModel}
          onSelectionModelChange={(newSelectionModel) => {
            assertArrayString(newSelectionModel);
            dispatch(changeSelection({ selection: newSelectionModel }));
          }}
          rows={
            activeFileGroup.files.map<GridRowsProp[number]>((x) => {
              const target = fileTable[x];
              assertNonFileNodeDiff(target);
              return target.type === 'folder'
                ? {
                  id: target.id, name: target.name, mime: '', size: -1, tags: null,
                }
                : {
                  id: target.id,
                  name: target.name,
                  mime: target.mime,
                  size: target.size,
                  tags: serializeTags(target.tag),
                };
            })
          }
          columns={[
            { field: 'id', hide: true },
            { field: 'name', headerName: '名前', width: 200 },
            { field: 'mime', headerName: 'MIMEタイプ', width: 200 },
            {
              field: 'size', headerName: 'ファイルサイズ', type: 'number', width: 200,
            },
            {
              field: 'tags',
              headerName: 'タグ',
              width: 600,
              renderCell: (params: GridRenderCellParams<string>) => (params.value
                && deserializeTags(params.value).map((x) => (<TagButton key={x} tag={x} />))
              ),
            },
          ]}
        />
      </div>
    )
  );
}

export default FileGrid;
