import { ExhaustiveError } from '~/utils/assert';
import type {
  FileInfo,
  FileInfoFile,
  FileNode,
  FileTable,
} from '~/features/file/file.type';
import type {
  SearchQuery,
  SearchQuerySet,
  Highlight,
  StrSearchType,
  NumberSearchType,
  SearchQueryForRedux,
  SearchQuerySetForRedux,
  SearchQuerySetCommon,
} from './search.type';

/**
 * 検索用の正規化
 * @param before 正規化対象
 * @returns 正規化結果
 */
const searchNormalize = (before: string) => (
  // 大文字→小文字
  // カタカナ→ひらがな
  before
    .normalize('NFKC') // Unicode normalize
    .toLowerCase() // UpperCase → LowerCase
    .replace(/[\u30a1-\u30f6]/g, (match) => { // KATAKANA(ア) → HIRAGANA(あ)
      const chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    })
);

const strtest = (
  target: string,
  word: string | RegExp,
  searchType?: StrSearchType,
):[number, number] | null => {
  if (typeof word === 'string') {
    switch (searchType) {
      case 'eq': {
        // same value
        return target.normalize('NFC') === word.normalize('NFC') ? [0, word.length] : null;
      }
      case 'in': {
        // include
        const p = target.normalize('NFC').indexOf(word.normalize('NFC'));
        return p !== -1 ? [p, p + word.length] : null;
      }
      case 'inlike':
      default: {
        // include like
        const q = searchNormalize(target).indexOf(searchNormalize(word));
        return q !== -1 ? [q, q + word.length] : null;
      }
    }
  }
  const found = word.exec(target);
  return found ? [found.index, found.index + found[0].length] : null;
};

const numtest = (target: number, value: number, operator: NumberSearchType):boolean => {
  switch (operator) {
    case '>':
      return target > value;
    case '<':
      return target < value;
    case '>=':
      return target >= value;
    case '<=':
      return target <= value;
    case '==':
      return target === value;
    default:
      // Comprehensiveness check
      throw new ExhaustiveError(operator);
  }
};

export const searchTest = (
  target: FileNode<FileInfoFile>,
  query: SearchQuery,
  filetable: FileTable,
): Highlight[] | null => {
  let allMarker :Highlight[] = [];
  let isAllOK = false;
  query.forEach((orterm) => {
    const marker: Highlight[] = [];
    const isOK = orterm.every((andterm) => {
      switch (andterm.type) {
        case 'tag':
          return target.tag.includes(andterm.value);
        case 'dir':
          if (andterm.searchSubDir) {
            let t: string | null = target.id;
            let isSubDir = false;
            while (t) {
              const subtarget: FileNode<FileInfo> = filetable[t];
              if (andterm.id === target.id) {
                isSubDir = true;
                break;
              }
              t = subtarget.parentId;
            }
            return isSubDir;
          }
          return target.prevId === andterm.id;
          break;
        case 'size':
          return numtest(target[andterm.type], andterm.value, andterm.operator);
        case 'name':
        case 'mime': {
          const mk = strtest(target[andterm.type], andterm.word, andterm.searchType);
          if (mk) {
            marker.push([andterm.type, ...mk]);
          }
          return !!mk;
        }
        default:
          // Comprehensiveness check
          throw new ExhaustiveError(andterm);
      }
    });
    if (isOK) allMarker = [...allMarker, ...marker];
    isAllOK = isAllOK || isOK;
  });
  return isAllOK ? allMarker.sort((a, b) => (a[1] - b[1] === 0 ? a[2] - b[2] : a[1] - b[1])) : null;
};

const genStrToken = (plainStr: string, type: Highlight[0]): SearchQueryToken => {
  if (plainStr.startsWith('"') && plainStr.endsWith('"') && plainStr.length > 2) {
    return { type, word: plainStr.slice(1, -1), searchType: 'in' };
  }
  if (plainStr.startsWith('/') && plainStr.endsWith('/') && plainStr.length > 2) {
    try {
      return { type, word: new RegExp(plainStr.slice(1, -1)), searchType: 'in' }
    }catch(e){
      return { type, word: plainStr, searchType: 'in', error: true }
    }
  }
  return { type, word: plainStr };
};

export const exchangeSearchQueryForRedux = (query: SearchQuery): SearchQueryForRedux => {
  return query.map(x => x.map(((set):SearchQuerySetForRedux => {
    if (set.type === 'name' || set.type === 'mime'){
      return {...set, word: (typeof set.word === 'string' ? set.word : {type: 'RegExp', word: set.word.toString()})}
    } else {
      return set as SearchQuerySetCommon;
    }
  }
  )))
}

export const hasSearchQueryHasError = (query: SearchQuery|SearchQueryForRedux): boolean => {
  return query.some(x => x.some(y => (y.type === 'name' || y.type === 'mime') && y.error))
}
/**
 * 指定位置にmarkタグを追加
 * @param value 対象文字列
 * @param start 開始位置
 * @param end 終了位置
 * @returns
 */
const addMark = (value: string, start: number, end: number) => `${value.slice(0, start)}<mark>${value.slice(start, end)}</mark>${value.slice(end)}`;

/**
 * markタグを追加したHTMLを返す
 * @param value 対象文字列
 * @param target 変換対象
 * @param marker ハイライト位置
 * @returns html
 */
export const highlightMark = (value: string, target: Highlight[0], marker:Highlight[]) => {
  // marker is sorted by maker[1]
  let preStart = -1; let preEnd = -1; let expansion = 0; let variablevalue = value;
  marker.forEach((x) => {
    if (target !== x[0]) return;
    if (x[1] + expansion < preEnd) {
      preEnd = x[2] + expansion;
    } else {
      if (preEnd >= 0) {
        variablevalue = addMark(variablevalue, preStart, preEnd);
        expansion += 13;
      }
      preStart = x[1] + expansion;
      preEnd = x[2] + expansion;
    }
  });
  if (preEnd >= 0) variablevalue = addMark(variablevalue, preStart, preEnd);
  return variablevalue;
};

/**
 * テーブルから対象のファイルをリストアップ
 * @param filetable
 * @param query
 * @returns
 */
export const searchFromTable = (filetable: FileTable, query: SearchQuery) => {
  const result: [string, Highlight[]][] = [];
  Object.values(filetable).forEach((x) => {
    // 探索対象は最新のファイル実体のみ
    if (x.type !== 'file' || x.history.length === 0) return;
    const mk = searchTest(x, query, filetable);
    if (mk) result.push([x.id, mk]);
  });
  return result;
};

type SearchQueryToken = SearchQuerySet | { 'type': 'OR' } | null;
export class SearchQueryParser {
  #queryString: string;

  #querySize: number;

  #currentPoint :number;

  #token: SearchQueryToken;

  #result: SearchQuery | null;

  constructor(queryString: string) {
    this.#queryString = queryString;
    this.#querySize = queryString.length;
    this.#currentPoint = 0;
    this.#result = null;
    this.#token = null;
  }

  get query():SearchQuery {
    if (this.#result) return this.#result;

    const result = this.#statement();
    this.#result = result;
    return result;
  }

  #statement(): SearchQuery {
    let token: SearchQueryToken;
    const orterms: SearchQuerySet[][] = [];
    let andterms: SearchQuerySet[] = [];

    /**
     * トークンからクエリ配列生成
     */
    // eslint-disable-next-line no-cond-assign
    while (token = this.#nextToken()) {
      if (token.type === 'OR') {
        if (andterms.length > 0) orterms.push(andterms);
        andterms = [];
      } else {
        andterms.push(token);
      }
    }
    if (andterms.length > 0) orterms.push(andterms);
    return orterms;
  }

  /**
   * 空白文字でない文字まで移動する
   */
  #skipSpace():void {
    while (this.#currentPoint < this.#querySize && /\s/.test(this.#queryString[this.#currentPoint])) {
      this.#currentPoint += 1;
    }
  }

  /**
   * 指定位置から始まる文字列を切り出す
   *  */
  #word() {
    let t = '';
    const firstChar = this.#queryString[this.#currentPoint];
    if (firstChar === '"') {
      // "x y"
      t += firstChar;
      this.#currentPoint += 1;
      while (
        this.#currentPoint < this.#querySize
        && this.#queryString[this.#currentPoint] !== firstChar
      ) {
        t += this.#queryString[this.#currentPoint];
        this.#currentPoint += 1;
      }
      if (this.#currentPoint < this.#querySize
        && this.#queryString[this.#currentPoint] === firstChar) {
        t += firstChar;
        this.#currentPoint += 1;
      }
    } else {
      // normal
      while (
        this.#currentPoint < this.#querySize
        && /[^\s]/.test(this.#queryString[this.#currentPoint])
      ) {
        t += this.#queryString[this.#currentPoint];
        this.#currentPoint += 1;
      }
    }
    return t;
  }

  /**
   * 指定位置から始まる数字を切り出す
   *  */
  #number(): number {
    let n = 0;
    while (this.#currentPoint < this.#querySize && /\d/.test(this.#queryString[this.#currentPoint])) {
      n = n * 10 + parseInt(this.#queryString[this.#currentPoint], 10);
      this.#currentPoint += 1;
    }
    return n;
  }

  /**
   * 指定位置から始まる演算子の取得
   */
  #operator():Parameters<typeof numtest>[2] | null {
    const next2 = this.#queryString.slice(this.#currentPoint, this.#currentPoint + 2);
    if (next2 === '<=' || next2 === '>=' || next2 === '==') {
      this.#currentPoint += 2;
      return next2;
    }
    const next = this.#queryString.slice(this.#currentPoint, this.#currentPoint + 1);
    if (next === '=') {
      this.#currentPoint += 1;
      return '==';
    }
    if (next === '<' || next === '>') {
      this.#currentPoint += 1;
      return next;
    }
    return null;
  }

  #nextToken(): SearchQueryToken {
    this.#skipSpace();
    if (this.#currentPoint >= this.#querySize) return null;

    // super query
    const next4 = this.#queryString.slice(this.#currentPoint, this.#currentPoint + 4).toLowerCase();
    if (next4 === 'tag:') {
      // tag
      this.#currentPoint += 4;
      this.#skipSpace();
      const value = this.#word();
      return { type: 'tag', value };
    }
    const next5 = this.#queryString.slice(this.#currentPoint, this.#currentPoint + 5).toLowerCase();
    if ((next4 === 'mime' || next4 === 'name') && next5[4] === ':') {
      // mime
      this.#currentPoint += 5;
      this.#skipSpace();
      return genStrToken(this.#word(), next4);
    } if (next5 === 'size:') {
      // size
      this.#currentPoint += 5;
      this.#skipSpace();
      const operator = this.#operator() ?? '==';
      this.#skipSpace();
      const value = this.#number();
      return { type: 'size', value, operator };
    }
    const value = this.#word();
    if (searchNormalize(value) === 'or') {
      return { type: 'OR' };
    }

    return genStrToken(value, 'name');
  }
}
