import React from 'react'

import { useAppSelector } from '../../app/hooks'

import Timeline from '@mui/lab/Timeline'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import { FileState } from './fileSlice'
import { assertNonFileNodeDiff } from './filetypeAssert'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'
import { FileInfo } from './file.type'
import { TagButton } from './TagButton'

/**
 * 差分情報から差分説明を作成
 */
export const createDiffExpression = (before: FileInfo, after: FileInfo):JSX.Element => {
  const result: JSX.Element[] = []
  if (before.name !== after.name) {
    result.push(<React.Fragment key='0'>{`ファイル名を"${after.name}"に変更`}</React.Fragment>)
  }
  if (before.parentId !== after.parentId) {
    result.push(<React.Fragment key='1'>{`ディレクトリを移動`}</React.Fragment>)
  }
  if (after.type === 'diff') {
    if (after.diff.addtag && after.diff.addtag.length > 0) {
      result.push(<React.Fragment key='2'>{[...after.diff.addtag.map(x => <TagButton key={x} tag={x}/>), <>タグを追加</>]}</React.Fragment>)
    }
    if (after.diff.deltag && after.diff.deltag.length > 0) {
      result.push(<React.Fragment key='3'>{[...after.diff.deltag.map(x => <TagButton key={x} tag={x}/>), <>タグを削除</>]}</React.Fragment>)
    }
  }
  return <>{[...result, <React.Fragment key='4'>しました</React.Fragment>]}</>
}

export const DiffTree = () => {
  const { activeFile, fileTable } = useAppSelector<FileState>(state => state.file)

  if (!activeFile) return <></>

  const targetNode = fileTable[activeFile.fileId]
  assertNonFileNodeDiff(targetNode)
  const history = targetNode.history

  return (
    <Timeline>
      {history.map((x, i) => {
        const node = fileTable[x]
        return (
          <TimelineItem key={node.id}>
            <TimelineOppositeContent color="text.secondary" style={{
              flex: 0.2
            }}>
              {(new Date(node.createdAt)).toLocaleString()}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot variant={node.type === 'diff' ? 'outlined' : 'filled'} />
              {history.length - 1 !== i ? <TimelineConnector /> : <></>}
            </TimelineSeparator>
            <TimelineContent>
              {
                history.length - 1 !== i
                  ? createDiffExpression(fileTable[history[i + 1]].origin.fileInfo, node.origin.fileInfo)
                  : `${node.origin.fileInfo.name}をアップロードしました`
              }
            </TimelineContent>
          </TimelineItem>
        )
      })}
    </Timeline>
  )
}
