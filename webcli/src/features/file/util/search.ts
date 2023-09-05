import type { UniqueIdentifier } from '@dnd-kit/core';
import type {
  FileInfo,
  FileInfoFile,
  FileNode,
  FileTable,
} from '~/features/file/file.type';
import type { DistributiveOmit } from '~/utils/assert';
import { ExhaustiveError, assertString } from '~/utils/assert';
import type {
  SearchQuery,
  SearchQuerySet,
  Highlight,
  StrSearchType,
  NumberSearchType,
  SearchQueryForRedux,
  SearchQuerySetForRedux,
  SearchQuerySetPrimitiveOnly,
  SearchQuerySetForReduxString,
  SearchQueryForReduxOmitId,
  SearchQueryTermForReduxOmitId,
  SearchQueryAndTermForReduxOmitId,
  SearchQueryAndTermForRedux,
} from './search.type';

/**
 * 検索用の正規化
 * @param before 正規化対象
 * @returns 正規化結果
 */
const searchNormalize = (before: string) =>
  // 大文字→小文字
  // カタカナ→ひらがな
  before
    .normalize('NFKC') // Unicode normalize
    .toLowerCase() // UpperCase → LowerCase
    .replace(/[\u30a1-\u30f6]/g, (match) => {
      // KATAKANA(ア) → HIRAGANA(あ)
      const chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    });

const strtest = (
  target: string,
  word: string | RegExp,
  searchType?: StrSearchType,
): [number, number] | null => {
  if (typeof word === 'string') {
    switch (searchType) {
      case 'eq': {
        // same value
        return target.normalize('NFC') === word.normalize('NFC')
          ? [0, word.length]
          : null;
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

const numtest = (
  target: number,
  value: number,
  operator: NumberSearchType,
): boolean => {
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

/**
 * ファイルに対し検索クエリの結果を返す
 * @param target 対象ノード
 * @param query 検索クエリ
 * @param filetable ファイルテーブル
 * @returns
 */
export const searchTest = (
  target: FileNode<FileInfoFile>,
  query: SearchQuery,
  filetable: FileTable,
): Highlight[] | null => {
  let allMarker: Highlight[] = [];
  let isAllOK = false;
  query.term.forEach((orterm) => {
    const marker: Highlight[] = [];
    const isOK = orterm.term.every((andterm) => {
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
        case 'size':
          return numtest(target[andterm.type], andterm.value, andterm.operator);
        case 'name':
        case 'mime': {
          const mk = strtest(
            target[andterm.type],
            andterm.word,
            andterm.searchType,
          );
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
  return isAllOK
    ? allMarker.sort((a, b) => (a[1] - b[1] === 0 ? a[2] - b[2] : a[1] - b[1]))
    : null;
};

const compareString = (a: string, b: string) => (a > b ? 1 : a < b ? -1 : 0);
const compareArray = <T>(a: T[], b: T[], compareFn: (a: T, b: T) => number) => {
  if (a.length !== b.length) return a.length - b.length;
  for (let i = 0; i < a.length; i++) {
    const c = compareFn(a[i], b[i]);
    if (c !== 0) return c;
  }
  return 0;
};

const compareStringQuery = (
  a: DistributiveOmit<SearchQuerySetForReduxString, 'id'>,
  b: DistributiveOmit<SearchQuerySetForReduxString, 'id'>,
) => {
  if (typeof a.word === 'string') {
    if (typeof b.word === 'object') return 1;
    return compareString(a.word, b.word);
  } else {
    if (typeof b.word === 'string') return -1;
    return compareString(a.word.word, b.word.word);
  }
};

/**
 *
 */
const compareTerm = (
  a: SearchQueryTermForReduxOmitId,
  b: SearchQueryTermForReduxOmitId,
) => {
  if (a.type !== b.type) return compareString(a.type, b.type);
  switch (a.type) {
    case 'tag':
      assertString(b.type, 'tag');
      return compareString(a.value, b.value);
    case 'dir':
      assertString(b.type, 'dir');
      return compareString(a.dirid, b.dirid);
    case 'size':
      assertString(b.type, 'size');
      return a.operator !== b.operator
        ? compareString(a.operator, b.operator)
        : a.value - b.value;
    case 'name': {
      assertString(b.type, 'name');
      return compareStringQuery(a, b);
    }
    case 'mime': {
      assertString(b.type, 'mime');
      return compareStringQuery(a, b);
    }
    default:
      // Comprehensiveness check
      throw new ExhaustiveError(a);
  }
};

const compareAndTerm = (
  a: SearchQueryAndTermForReduxOmitId,
  b: SearchQueryAndTermForReduxOmitId,
) => compareArray(a.term, b.term, compareTerm);
const compareQuery = (
  a: SearchQueryForReduxOmitId,
  b: SearchQueryForReduxOmitId,
) => compareArray(a.term, b.term, compareAndTerm);

/**
 * 正規表現の文字列として正しいかテスト
 * @param str 正規表現文字列
 * @returns 正誤
 */
export const isRegExpText = (str: string) => {
  try {
    const _test = new RegExp(str);
    return true;
  } catch (_) {
    return false;
  }
};
/**
 * 与えられたユーザ入力をクエリに変換
 * @param plainStr ユーザ入力文字列
 * @param type クエリタイプ
 * @returns
 */
const genStrToken = (
  plainStr: string,
  type: Highlight[0],
): SearchQueryToken => {
  if (
    plainStr.startsWith('"') &&
    plainStr.endsWith('"') &&
    plainStr.length > 2
  ) {
    return { type, word: plainStr.slice(1, -1), searchType: 'in', id: '' };
  }
  if (
    plainStr.startsWith('/') &&
    plainStr.endsWith('/') &&
    plainStr.length > 2
  ) {
    try {
      return { type, word: new RegExp(plainStr.slice(1, -1)), id: '' };
    } catch (e) {
      return { type, word: plainStr, error: true, id: '' };
    }
  }
  return { type, word: plainStr, id: '' };
};

/**
 * 検索クエリをシリアライズ可能な要素に置き換え
 * @param query
 * @returns
 */
export const exchangeSearchQueryForRedux = (
  query: SearchQuery | SearchQueryForRedux,
): SearchQueryForRedux => {
  return {
    ...query,
    term: query.term.map((x) => ({
      ...x,
      term: x.term.map((set): SearchQuerySetForRedux => {
        if (set.type === 'name' || set.type === 'mime') {
          return {
            ...set,
            word:
              typeof set.word === 'string' || !(set.word instanceof RegExp)
                ? set.word
                : { type: 'RegExp', word: set.word.toString().slice(1, -1) },
          };
        } else {
          return set as SearchQuerySetPrimitiveOnly;
        }
      }),
    })),
  };
};

/**
 * 検索クエリをデシリアライズ
 * @param query
 * @returns
 */
export const exchangeSearchQuery = (
  query: SearchQueryForRedux,
): SearchQuery => {
  return {
    ...query,
    term: query.term.map((x) => ({
      ...x,
      term: x.term.map((set): SearchQuerySet => {
        if (set.type === 'name' || set.type === 'mime') {
          return {
            ...set,
            word:
              typeof set.word === 'string'
                ? set.word
                : new RegExp(set.word.word),
          };
        } else {
          return set as SearchQuerySetPrimitiveOnly;
        }
      }),
    })),
  };
};

export const omitIdFromQuery = (
  query: SearchQueryForRedux,
): SearchQueryForReduxOmitId => {
  const { id: _id, ...q } = {
    ...query,
    term: query.term.map((andTerm) => {
      const { id: _id, ...q } = {
        ...andTerm,
        term: andTerm.term.map((term) => {
          const { id: _id, ...q } = term;
          return q;
        }),
      };
      return q;
    }),
  };
  return q;
};
export const addEmptyIdToQuery = (
  query: SearchQueryForReduxOmitId,
): SearchQueryForRedux => ({
  ...query,
  id: '',
  term: query.term.map((andTerm) => ({
    ...andTerm,
    id: '',
    term: andTerm.term.map((term) => ({
      ...term,
      id: '',
    })),
  })),
});

/**
 * 検索クエリがエラーを持つか確認
 * @param query 対象クエリ
 * @returns
 */
export const hasSearchQueryHasError = (
  query: SearchQuery | SearchQueryForRedux,
): boolean => {
  return query.term.some((x) =>
    x.term.some((y) => (y.type === 'name' || y.type === 'mime') && y.error),
  );
};

const exchangeComparable = (
  query: SearchQueryForRedux,
): SearchQueryForReduxOmitId => {
  const { id: _id, ...q } = {
    ...query,
    term: query.term
      .map((andTerm) => {
        const { id: _id, ...q } = {
          ...andTerm,
          term: andTerm.term
            .map((term) => {
              const { id: _id, ...q } = term;
              return q;
            })
            .sort(compareTerm),
        };
        return q;
      })
      .sort(compareAndTerm),
  };
  return q;
};

export const isSearchQueryChanged = (
  beforeQuery: SearchQueryForRedux,
  afterQuery: SearchQueryForRedux,
) =>
  compareQuery(exchangeComparable(beforeQuery), exchangeComparable(afterQuery));

const searchQueryStringToString = (
  input: string | RegExp | { type: 'RegExp'; word: string },
) => {
  if (typeof input === 'object') {
    if (input instanceof RegExp) return input.toString();
    return `/${input.word}/`;
  }
  if (input.indexOf(' ') !== -1) return `"${input}"`;
  return input;
};

const searchQuerySetToString = (
  set: (SearchQuery | SearchQueryForRedux)['term'][number]['term'][number],
) => {
  switch (set.type) {
    case 'tag':
      return `tag: ${searchQueryStringToString(set.value)}`;
    case 'dir':
      // NO
      return '';
    case 'size':
      return `${set.type}: ${set.operator === '==' ? '' : `${set.operator} `}${
        set.value
      }`;
    case 'name':
    case 'mime':
      return `${
        set.type !== 'name' ? `${set.type}: ` : ''
      }${searchQueryStringToString(set.word)}`;
    default:
      // Comprehensiveness check
      return new ExhaustiveError(set);
  }
};

export const searchQueryBuilder = (
  query: SearchQuery | SearchQueryForRedux,
): string =>
  query.term
    .map((orTerm) =>
      orTerm.term.map((andTerm) => searchQuerySetToString(andTerm)).join(' '),
    )
    .filter((orTerm) => orTerm.length !== 0)
    .join(' OR ');

/**
 * 指定位置にmarkタグを追加
 * @param value 対象文字列
 * @param start 開始位置
 * @param end 終了位置
 * @returns
 */
const addMark = (value: string, start: number, end: number) =>
  `${value.slice(0, start)}<mark>${value.slice(start, end)}</mark>${value.slice(
    end,
  )}`;

/**
 * markタグを追加したHTMLを返す
 * @param value 対象文字列
 * @param target 変換対象
 * @param marker ハイライト位置
 * @returns html
 */
export const highlightMark = (
  value: string,
  target: Highlight[0],
  marker: Highlight[],
) => {
  // marker is sorted by maker[1]
  let preStart = -1;
  let preEnd = -1;
  let expansion = 0;
  let variablevalue = value;
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

export const searchQueryNormalizer = (
  query: SearchQuery | SearchQueryForRedux,
): SearchQueryForRedux => {
  const queryForRedux = exchangeSearchQueryForRedux(query);
  const andTerms = queryForRedux.term
    .filter((andTerm) => andTerm.term.length !== 0)
    .map((andTerm) => {
      const validTerm = new Set<string>();
      const flaggedTerm: SearchQueryForRedux['term'][number]['term'] = [];
      for (const term of andTerm.term) {
        const serializedTerm = JSON.stringify(term);
        if (validTerm.has(serializedTerm)) {
          flaggedTerm.push({ ...term, ignore: true });
        } else {
          validTerm.add(serializedTerm);
          flaggedTerm.push(term);
        }
      }
      return { ...andTerm, term: flaggedTerm };
    });
  const validAndTerm = new Set<string>();
  const flaggedTerm: SearchQueryForRedux['term'] = [];
  for (const term of andTerms) {
    const serializedTerm = JSON.stringify(
      term.term
        .map((x) => {
          const { ignore: _ignore, ...y } = x;
          return JSON.stringify(y);
        })
        .sort(),
    );
    if (validAndTerm.has(serializedTerm)) {
      flaggedTerm.push({ ...term, ignore: true });
    } else {
      validAndTerm.add(serializedTerm);
      flaggedTerm.push(term);
    }
  }
  const normalizedQuery: SearchQueryForRedux = {
    ...queryForRedux,
    term: flaggedTerm,
  };
  return {
    ...normalizedQuery,
    term: normalizedQuery.term.map((orTerm, i) => ({
      ...orTerm,
      id: `term${i}`,
      term: orTerm.term.map((term, j) => ({
        ...term,
        id: `term${i}-${j}`,
      })),
    })),
  };
};

export const searchTermById = <T extends { id: string }>(
  queryItem: { term: T[] },
  id: UniqueIdentifier,
): T | undefined => {
  return queryItem.term.filter((item) => item.id === id)[0];
};
export const getTermById = (
  searchQueryItem: SearchQueryForRedux,
  termId: UniqueIdentifier,
): { id: string; term: SearchQuerySetForRedux } | undefined => {
  const t = searchQueryItem.term
    .map((x) => ({ id: x.id, terms: x.term.filter((x) => x.id === termId) }))
    .filter((x) => x.terms.length !== 0);
  return t.length > 0 && t[0].terms.length > 0
    ? { id: t[0].id, term: t[0].terms[0] }
    : undefined;
};
export const indexOfById = <T extends { id: string }>(
  queryItem: { term: T[] },
  id: UniqueIdentifier,
) => {
  if (typeof id !== 'string') return -1;
  return queryItem.term.map((x) => x.id).indexOf(id);
};
export const hasById = <T extends { id: string }>(
  queryItem: { term: T[] },
  id: UniqueIdentifier,
) => queryItem.term.some((term) => term.id === id);
export const searchTerm = (
  searchQueryItem: SearchQueryForRedux,
  termId: UniqueIdentifier,
): SearchQueryAndTermForRedux | undefined => {
  return searchQueryItem.term.filter((andTerm) => hasById(andTerm, termId))[0];
};

type SearchQueryToken = SearchQuerySet | { type: 'OR' } | null;
export class SearchQueryParser {
  #queryString: string;

  #querySize: number;

  #currentPoint: number;

  #token: SearchQueryToken;

  #result: SearchQueryForRedux | null;

  constructor(queryString: string) {
    this.#queryString = queryString;
    this.#querySize = queryString.length;
    this.#currentPoint = 0;
    this.#result = null;
    this.#token = null;
  }

  get query(): SearchQueryForRedux {
    if (this.#result) return this.#result;

    const result = searchQueryNormalizer(this.#statement());
    this.#result = result;
    return result;
  }

  #statement(): SearchQuery {
    let token: SearchQueryToken;
    const orterms: SearchQuery['term'] = [];
    let andterms: SearchQuery['term'][number]['term'] = [];

    /**
     * トークンからクエリ配列生成
     */
    // eslint-disable-next-line no-cond-assign
    while ((token = this.#nextToken())) {
      if (token.type === 'OR') {
        if (andterms.length > 0) orterms.push({ term: andterms, id: '' });
        andterms = [];
      } else {
        andterms.push(token);
      }
    }
    if (andterms.length > 0) orterms.push({ term: andterms, id: '' });
    return { term: orterms, id: '' };
  }

  /**
   * 空白文字でない文字まで移動する
   */
  #skipSpace(): void {
    while (
      this.#currentPoint < this.#querySize &&
      /\s/.test(this.#queryString[this.#currentPoint])
    ) {
      this.#currentPoint += 1;
    }
  }

  /**
   * 指定位置から始まる文字列を切り出す
   *  */
  #word() {
    let t = '';
    const firstChar = this.#queryString[this.#currentPoint];
    if (firstChar === '"' || firstChar === '/') {
      // "x y"
      t += firstChar;
      this.#currentPoint += 1;
      while (
        this.#currentPoint < this.#querySize &&
        this.#queryString[this.#currentPoint] !== firstChar
      ) {
        t += this.#queryString[this.#currentPoint];
        this.#currentPoint += 1;
      }
      if (
        this.#currentPoint < this.#querySize &&
        this.#queryString[this.#currentPoint] === firstChar
      ) {
        t += firstChar;
        this.#currentPoint += 1;
      }
    } else {
      // normal
      while (
        this.#currentPoint < this.#querySize &&
        /[^\s]/.test(this.#queryString[this.#currentPoint])
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
    while (
      this.#currentPoint < this.#querySize &&
      /\d/.test(this.#queryString[this.#currentPoint])
    ) {
      n = n * 10 + parseInt(this.#queryString[this.#currentPoint], 10);
      this.#currentPoint += 1;
    }
    return n;
  }

  /**
   * 指定位置から始まる演算子の取得
   */
  #operator(): Parameters<typeof numtest>[2] | null {
    const next2 = this.#queryString.slice(
      this.#currentPoint,
      this.#currentPoint + 2,
    );
    if (next2 === '<=' || next2 === '>=' || next2 === '==') {
      this.#currentPoint += 2;
      return next2;
    }
    const next = this.#queryString.slice(
      this.#currentPoint,
      this.#currentPoint + 1,
    );
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
    const next4 = this.#queryString
      .slice(this.#currentPoint, this.#currentPoint + 4)
      .toLowerCase();
    if (next4 === 'tag:') {
      // tag
      this.#currentPoint += 4;
      this.#skipSpace();
      const value = this.#word();
      if (value.startsWith('"') && value.endsWith('"') && value.length > 2)
        return { type: 'tag', value: value.slice(1, -1), id: '' };
      return { type: 'tag', value, id: '' };
    }
    const next5 = this.#queryString
      .slice(this.#currentPoint, this.#currentPoint + 5)
      .toLowerCase();
    if ((next4 === 'mime' || next4 === 'name') && next5[4] === ':') {
      // mime | name
      this.#currentPoint += 5;
      this.#skipSpace();
      return genStrToken(this.#word(), next4);
    }
    if (next5 === 'size:') {
      // size
      this.#currentPoint += 5;
      this.#skipSpace();
      const operator = this.#operator() ?? '==';
      this.#skipSpace();
      const value = this.#number();
      return { type: 'size', value, operator, id: '' };
    }
    const value = this.#word();
    if (searchNormalize(value) === 'or') {
      return { type: 'OR' };
    }

    return genStrToken(value, 'name');
  }
}
