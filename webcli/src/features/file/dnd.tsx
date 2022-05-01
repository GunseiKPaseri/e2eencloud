import { NativeTypes } from 'react-dnd-html5-backend';
import type { DragSourceHookSpec, DropTargetHookSpec } from 'react-dnd';
import type { useAppDispatch } from '../../app/hooks';
import { fileuploadAsync, createDiffAsync } from './fileSlice';

// https://github.com/react-dnd/react-dnd/blob/9b002d24d51ecb671d049fc44679372b818f9630/packages/backend-html5/src/NativeDragSources/nativeTypesConfig.ts#L19
type DnDFileObject = {
  type: undefined;
  files: File[];
  items: DataTransferItemList;
  dataTransfer: DataTransfer;
};

const APP_FILE_NODE = '__APP_FILE_NODE__';
type DnDFileNodeObject = { type: typeof APP_FILE_NODE, id: string };

export const genUseDropReturn = (dirId: string | null, dispatch: ReturnType<typeof useAppDispatch>):
DropTargetHookSpec<
DnDFileObject | DnDFileNodeObject,
void,
{ isOver: boolean; canDrop: boolean; }
> => ({
  accept: [NativeTypes.FILE, APP_FILE_NODE],
  drop: (props, monitor) => {
    // avoid deep
    if (!monitor.isOver({ shallow: true }) || !dirId) return;
    // console.log(props);
    switch (props.type) {
      case APP_FILE_NODE:
        // オブジェクトなら親を移動する
        dispatch(createDiffAsync({ targetId: props.id, newParentId: dirId }));
        break;
      default:
        // ローカルからD&Dしたファイルオブジェクト
        // avoid folder
        if (props.files.length > 0 && props.files.every((x) => x.type !== '')) {
          const acceptedFiles = props.files;
          dispatch(fileuploadAsync({ files: acceptedFiles, parentId: dirId }));
          // console.log(acceptedFiles, dirId);
        }
    }
  },
  canDrop: () => (!!dirId),
  collect: (monitor) => ({
    isOver: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
  }),
});
export const genUseDragReturn = (id: string): DragSourceHookSpec<
DnDFileNodeObject,
void,
{ isDragging: boolean; }
> => ({
  type: APP_FILE_NODE,
  item: { type: APP_FILE_NODE, id },
  collect: (monitor) => ({
    isDragging: !!monitor.isDragging(),
  }),
});
