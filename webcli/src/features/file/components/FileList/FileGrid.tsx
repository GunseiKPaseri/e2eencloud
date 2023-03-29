import React from 'react';

import type { SxProps, Theme } from '@mui/material/styles';

import {
  DataGrid, jaJP,
} from '@mui/x-data-grid';
import type {
  GridRenderCellParams, GridRowsProp, GridInputRowSelectionModel,
} from '@mui/x-data-grid';

import { useAppDispatch, useAppSelector } from '~/lib/react-redux';
import { assertArrayString } from '~/utils/assert';
import { type FileState, changeSelection } from '~/features/file/fileSlice';
import { assertNonFileNodeDiff } from '~/features/file/filetypeAssert';
import TagButton from '~/features/file/components/TagButton';
import { serializeTags, deserializeTags } from '~/features/file/util/serializeTags';

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
  const selectionModel: GridInputRowSelectionModel = activeFileGroup?.selecting ?? [];
  // console.log(selectionModel);

  return (activeFileGroup
    && (
      <div style={{ height: 300, width: '100%' }} ref={nodeRef}>
        <DataGrid
          sx={sx}
          localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
          editMode="row"
          checkboxSelection
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={(newSelectionModel) => {
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
          initialState={{
            columns: {
              columnVisibilityModel: {
                id: false,
              },
            },
          }}
          columns={[
            { field: 'id' },
            { field: 'name', headerName: '名前', width: 200 },
            { field: 'mime', headerName: 'MIMEタイプ', width: 200 },
            {
              field: 'size', headerName: 'ファイルサイズ', type: 'number', width: 200,
            },
            {
              field: 'tags',
              headerName: 'タグ',
              width: 600,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              renderCell: (params: GridRenderCellParams<any, string>) => (
                params.value
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
