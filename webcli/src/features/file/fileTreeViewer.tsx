import React from 'react'
import { useAppSelector } from '../../app/hooks'
import { FileTree } from './fileSlice'

const FileTreeNodes = (props: {name?: string, tree: FileTree, onSelect: (id :string)=>void}) => {
  return (<ul>{props.name || ''}{
    props.tree.map(x => <li key={x.id}>{
      x.type === 'folder'
        ? <FileTreeNodes tree={x.files} onSelect={props.onSelect}/>
        : <a onClick={(e) => { e.preventDefault(); props.onSelect(x.id) }}>{x.name}</a>
      }</li>)
  }</ul>)
}

export const FileTreeViewer = (props: {onSelect: (id :string)=>void}) => {
  const fileState = useAppSelector((store) => store.file)

  return <FileTreeNodes tree={fileState.files} onSelect={props.onSelect} />
}
