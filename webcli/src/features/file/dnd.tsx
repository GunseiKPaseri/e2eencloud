import { NativeTypes } from 'react-dnd-html5-backend'
import { DragSourceHookSpec, DropTargetHookSpec } from 'react-dnd'
import { useAppDispatch } from '../../app/hooks'
import { fileuploadAsync, createDiffAsync } from './fileSlice'

// https://github.com/react-dnd/react-dnd/blob/9b002d24d51ecb671d049fc44679372b818f9630/packages/backend-html5/src/NativeDragSources/nativeTypesConfig.ts#L19
type DnDFileObject = {type: undefined; files: File[]; items: DataTransferItemList; dataTransfer: DataTransfer; }

const __APP_FILE_NODE__ = '__APP_FILE_NODE__'
type DnDFileNodeObject = {type: typeof __APP_FILE_NODE__, id: string}

export const genUseDropReturn =
  (dirId: string | null, dispatch: ReturnType<typeof useAppDispatch>):
    DropTargetHookSpec<
      DnDFileObject | DnDFileNodeObject,
      void,
      { isOver: boolean; canDrop: boolean; }
    > => {
    return {
      accept: [NativeTypes.FILE, __APP_FILE_NODE__],
      drop: (props, monitor) => {
        // avoid deep
        if (!monitor.isOver({ shallow: true }) || !dirId) return
        console.log(props)
        switch (props.type) {
          case __APP_FILE_NODE__:
            // オブジェクトなら親を移動する
            dispatch(createDiffAsync({ targetId: props.id, newParentId: dirId }))
            break
          default:
            // ローカルからD&Dしたファイルオブジェクト
            // avoid folder
            if (props.files.length > 0 && props.files.every(x => x.type !== '')) {
              const acceptedFiles = props.files
              dispatch(fileuploadAsync({ files: acceptedFiles, parentId: dirId }))
              console.log(acceptedFiles, dirId)
            }
        }
      },
      canDrop: (props, monitor) => {
        // console.log(monitor.getItem())
        return !!dirId
      },
      collect: (monitor) => {
        return {
          isOver: monitor.isOver({ shallow: true }),
          canDrop: monitor.canDrop()
        }
      }
    }
  }
export const genUseDragReturn = (id: string): DragSourceHookSpec<
  DnDFileNodeObject,
  void,
  { isDragging: boolean; }
> => {
  return {
    type: __APP_FILE_NODE__,
    item: { type: __APP_FILE_NODE__, id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }
}
