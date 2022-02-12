import { useAppDispatch } from '../../app/hooks'
import { FileTreeViewer } from './FileTreeViewer'
import { FileList } from './FileList'
import { Viewer } from './Viewer'
import { AddFolder } from './AddFolder'
import { DiffTree } from './DiffTree'

export const FileDropZone = () => {

  return (
    <article>
      <h2>ファイルツリー</h2>
      <FileTreeViewer />
      <h2>ファイルリスト</h2>
      <FileList />
      <h2>フォルダ作成</h2>
      <AddFolder />
      <h2>ファイルビュー</h2>
      <Viewer />
      <h2>ファイルヒストリー</h2>
      <DiffTree />
    </article>
  )
}
