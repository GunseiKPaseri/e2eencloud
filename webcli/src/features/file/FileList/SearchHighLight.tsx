import { Highlight, highlightMark } from '../util/search'
import parse from 'html-react-parser'

export const SearchHighLight = (props: {value: string, search?: {target: Highlight[0], mark: Highlight[]}}) => {
  if (props.search) {
    return <>{parse(highlightMark(props.value, props.search.target, props.search.mark))}</>
  } else {
    return <>{props.value}</>
  }
}
