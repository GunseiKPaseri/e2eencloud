import parse from 'html-react-parser';
import { highlightMark } from '../util/search';
import type { Highlight } from '../util/search.type';

function SearchHighLight(
  { value, search }: { value: string, search?: { target: Highlight[0], mark: Highlight[] } },
) {
  if (search) {
    return <>{parse(highlightMark(value, search.target, search.mark))}</>;
  }
  return <>{value}</>;
}

export default SearchHighLight;
