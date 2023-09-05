import Typography from '@mui/material/Typography';
import type { SearchQuerySetForRedux } from '../../../util/search.type';

function QueryKeyWordLabel({ querySet }: { querySet: SearchQuerySetForRedux }) {
  switch (querySet.type) {
    case 'dir':
      return (
        <>
          ファイルID：<em>{querySet.id}</em>
        </>
      );
    case 'mime':
    case 'name':
      return (
        <>
          {querySet.type === 'mime' ? 'MIMEタイプ' : 'ファイル名'}：
          {typeof querySet.word === 'string' ? (
            <>
              <Typography component='em'>{querySet.word}</Typography>
              {querySet.searchType === 'eq'
                ? 'に一致'
                : querySet.searchType === 'in'
                ? 'を完全に含む'
                : 'を含む'}
            </>
          ) : (
            <>
              <Typography
                color='secondary'
                component='em'
              >{`/${querySet.word.word}/`}</Typography>
              を満たす
            </>
          )}
        </>
      );
    case 'tag':
      return (
        <>
          タグ：<em>{querySet.value}</em>
        </>
      );
    case 'size':
      return (
        <>
          ファイルサイズ：
          <em>
            {querySet.operator}
            {querySet.value}
          </em>
        </>
      );
  }
}

export default QueryKeyWordLabel;
