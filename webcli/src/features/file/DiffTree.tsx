import React from 'react'

import { useAppSelector } from '../../app/hooks'

import Timeline from '@mui/lab/Timeline'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import Box from '@mui/material/Box'
import { FileState } from './fileSlice'
import { assertNonFileNodeDiff } from './utils'

export const DiffTree = () => {
  const { activeFile, fileTable } = useAppSelector<FileState>(state => state.file)

  if (!activeFile) return <></>

  const targetNode = fileTable[activeFile.fileId]
  assertNonFileNodeDiff(targetNode)
  const history = targetNode.history

  return (
    <Box>
      <Timeline>
      {history.map((x, i) => {
        const node = fileTable[x]
        return (
          <TimelineItem key={node.id}>
            <TimelineSeparator>
              <TimelineDot />
              {history.length - 1 !== i ? <TimelineConnector /> : <></>}
            </TimelineSeparator>
            <TimelineContent>{node.originalFileInfo.name}</TimelineContent>
          </TimelineItem>
        )
      })}
      </Timeline>
    </Box>)
}
