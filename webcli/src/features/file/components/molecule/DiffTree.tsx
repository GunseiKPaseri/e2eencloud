import React from 'react';

import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import { useAppSelector } from '~/lib/react-redux';
import type { FileState } from '~/features/file/fileSlice';
import { assertNonFileNodeDiff } from '~/features/file/filetypeAssert';
import type { FileInfo } from '~/features/file/file.type';
import TagButton from '../atom/TagButton';

/**
 * 差分情報から差分説明を作成
 */
export function CreateDiffExpression(params: { before: FileInfo, after: FileInfo }):JSX.Element {
  const { before, after } = params;
  const result: JSX.Element[] = [];
  if (before.name !== after.name) {
    result.push(<React.Fragment key="0">{`ファイル名を"${after.name}"に変更`}</React.Fragment>);
  }
  if (before.parentId !== after.parentId) {
    result.push(<React.Fragment key="1">ディレクトリを移動</React.Fragment>);
  }
  if (after.type === 'diff') {
    if (after.diff.addtag && after.diff.addtag.length > 0) {
      // console.log(after.diff.addtag);
      result.push(<React.Fragment key="2">{[...after.diff.addtag.map((x) => <TagButton key={x} tag={x} />), <React.Fragment key="_">タグを追加</React.Fragment>]}</React.Fragment>);
    }
    if (after.diff.deltag && after.diff.deltag.length > 0) {
      result.push(<React.Fragment key="3">{[...after.diff.deltag.map((x) => <TagButton key={x} tag={x} />), <React.Fragment key="_">タグを削除</React.Fragment>]}</React.Fragment>);
    }
  }
  return <>{[...result, <React.Fragment key="4">しました</React.Fragment>]}</>;
}

export function DiffTree() {
  const { activeFile, fileTable } = useAppSelector<FileState>((state) => state.file);

  if (!activeFile) return null;

  const targetNode = fileTable[activeFile.fileId];
  assertNonFileNodeDiff(targetNode);
  const { history } = targetNode;

  return (
    <Timeline>
      {history.map((x, i) => {
        const node = fileTable[x];
        return (
          <TimelineItem key={node.id}>
            <TimelineOppositeContent
              color="text.secondary"
              style={{
                flex: 0.2,
              }}
            >
              {(new Date(node.createdAt)).toLocaleString()}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot variant={node.type === 'diff' ? 'outlined' : 'filled'} />
              {history.length - 1 !== i && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              {
                history.length - 1 !== i
                  ? CreateDiffExpression({
                    before: fileTable[history[i + 1]].origin.fileInfo,
                    after: node.origin.fileInfo,
                  })
                  : `${node.origin.fileInfo.name}をアップロードしました`
              }
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}
