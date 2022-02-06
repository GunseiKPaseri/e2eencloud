import React from 'react'

import { useAppSelector } from '../../app/hooks'

import Timeline from '@mui/lab/Timeline'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import { FileState } from './fileSlice'
import { assertNonFileNodeDiff, createDiffExpression } from './utils'
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent'

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
          <TimelineItem key={node.id} sx={{
            '&::before': {
              flex: 0
            }
          }}>
            <TimelineOppositeContent color="text.secondary">
              09:30 am
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot variant={node.type === 'diff' ? 'outlined' : 'filled'} />
              {history.length - 1 !== i ? <TimelineConnector /> : <></>}
            </TimelineSeparator>
            <TimelineContent>
              {
                history.length - 1 !== i
                  ? createDiffExpression(fileTable[history[i + 1]].originalFileInfo, node.originalFileInfo)
                  : node.originalFileInfo.name
              }
            </TimelineContent>
          </TimelineItem>
        )
      })}
    </Timeline>
  )
}
