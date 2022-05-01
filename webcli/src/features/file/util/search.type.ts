export type StrSearchType = 'eq' | 'in' | 'inlike';
export type NumberSearchType = '>' | '<' | '>=' | '<=' | '==';

export type SearchQuerySet =
{
  type: 'tag',
  value: string
} |
{
  type: 'dir',
  id: string,
  searchSubDir: boolean
} |
// str
{
  type: 'name' | 'mime',
  word: string | RegExp,
  searchType?: StrSearchType
} |
// num
{
  type: 'size',
  value: number,
  operator: NumberSearchType
};

export type SearchQuery = SearchQuerySet[][];

export type Highlight = ['name' | 'mime', number, number];
