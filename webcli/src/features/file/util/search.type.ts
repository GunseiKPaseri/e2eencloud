export type StrSearchType = 'eq' | 'in' | 'inlike';
export type NumberSearchType = '>' | '<' | '>=' | '<=' | '==';

export type SearchQuerySetCommon =
{
  type: 'tag',
  value: string
} |
{
  type: 'dir',
  id: string,
  searchSubDir: boolean
} |
// num
{
  type: 'size',
  value: number,
  operator: NumberSearchType
};

export type SearchQuerySet = SearchQuerySetCommon |
// str
{
  type: 'name' | 'mime',
  word: string | RegExp,
  searchType?: StrSearchType,
  error?: boolean,
}

export type SearchQuery = SearchQuerySet[][];

export type SearchQuerySetForRedux = SearchQuerySetCommon | 
{
  type: 'name' | 'mime',
  word: string | {type: 'RegExp', word: string},
  searchType?: StrSearchType,
  error?: boolean,
}

export type SearchQueryForRedux = SearchQuerySetForRedux[][]

export type Highlight = ['name' | 'mime', number, number];
