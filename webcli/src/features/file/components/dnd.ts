import type { DragSourceHookSpec, DropTargetHookSpec } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import type { useAppDispatch } from '~/lib/react-redux';
import { fileuploadAsync, createDiffAsync } from '~/features/file/fileSlice';

// https://github.com/react-dnd/react-dnd/blob/9b002d24d51ecb671d049fc44679372b818f9630/packages/backend-html5/src/NativeDragSources/nativeTypesConfig.ts#L19
type DnDFileObject = {
  type: undefined;
  files: File[];
  items: DataTransferItemList;
  dataTransfer: DataTransfer;
};

const APP_FILE_NODE = '__APP_FILE_NODE__';
type DnDFileNodeObject = { type: typeof APP_FILE_NODE; id: string };

export const genUseDropReturn = (
  dispatch: ReturnType<typeof useAppDispatch>,
  dirId?: string | null,
): DropTargetHookSpec<
  DnDFileObject | DnDFileNodeObject,
  void,
  { isOver: boolean; canDrop: boolean }
> => ({
  accept: [NativeTypes.FILE, APP_FILE_NODE],
  canDrop: () => !!dirId,
  collect: (monitor) => ({
    canDrop: monitor.canDrop(),
    isOver: monitor.isOver({ shallow: true }),
  }),
  drop: (props, monitor) => {
    // avoid deep
    if (!monitor.isOver({ shallow: true }) || !dirId) return;
    // console.log(props);
    switch (props.type) {
      case APP_FILE_NODE: {
        // オブジェクトなら親を移動する
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        dispatch(createDiffAsync({ newParentId: dirId, targetId: props.id }));
        break;
      }
      default: {
        // ローカルからD&Dしたファイルオブジェクト
        // avoid folder
        if (props.files.length > 0 && props.files.every((x) => x.type !== '')) {
          const acceptedFiles = props.files;
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          dispatch(fileuploadAsync({ files: acceptedFiles, parentId: dirId }));
          // console.log(acceptedFiles, dirId);
        }
      }
    }
  },
});
export const genUseDragReturn = (
  id: string,
): DragSourceHookSpec<DnDFileNodeObject, void, { isDragging: boolean }> => ({
  collect: (monitor) => ({
    isDragging: !!monitor.isDragging(),
  }),
  item: { id, type: APP_FILE_NODE },
  type: APP_FILE_NODE,
});
