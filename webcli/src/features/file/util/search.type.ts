import { $const, $union } from 'lizod';
import type { DistributiveOmit, Expand } from '~/utils/assert';

export type StrSearchType = 'eq' | 'in' | 'inlike';
export const strSearchTypeValidator = $union([$const("eq"), $const("in"), $const("inlike")])

export type NumberSearchType = '>' | '<' | '>=' | '<=' | '==';

export const numberSearchTypeValidator = $union([$const(">"), $const("<"), $const(">="), $const("<="), $const("==")])

type SearchQuerySetCommonOption ={
  id: string
  ignore?: boolean
}

export type SearchQuerySetPrimitiveOnly = Expand<(
{
  type: 'tag'
  value: string
} |
{
  type: 'dir'
  dirid: string
  searchSubDir: boolean
} |
// num
{
  type: 'size'
  value: number
  operator: NumberSearchType
}) & SearchQuerySetCommonOption>;

export const searchQuerySetTypeValidator = $union([$const("name"), $const("mime"), $const("tag"), $const("size"), $const("dir")])

export type SearchQuerySet = SearchQuerySetPrimitiveOnly |
  // str
  ({
    type: 'name' | 'mime'
    word: string | RegExp
    searchType?: StrSearchType
    error?: boolean
  } & SearchQuerySetCommonOption)

export type SearchQueryAndTerm = {
  term: SearchQuerySet[]
} & SearchQuerySetCommonOption

export type SearchQuery = {
  term: SearchQueryAndTerm[]
} & SearchQuerySetCommonOption

export type SearchQuerySetForReduxString = {
  type: 'name' | 'mime'
  word: string | {type: 'RegExp', word: string}
  searchType?: StrSearchType
  error?: boolean
} & SearchQuerySetCommonOption

export type SearchQuerySetForRedux = SearchQuerySetPrimitiveOnly | SearchQuerySetForReduxString

export type SearchQueryAndTermForRedux = {
  term: SearchQuerySetForRedux[]
} & SearchQuerySetCommonOption

export type SearchQueryForRedux = {
  term: SearchQueryAndTermForRedux[]
} & SearchQuerySetCommonOption

export type Highlight = ['name' | 'mime', number, number];

export type SearchQueryTermForReduxOmitId = DistributiveOmit<SearchQuerySetForRedux, 'id'>
export type SearchQueryAndTermForReduxOmitId = DistributiveOmit<SearchQueryForRedux['term'][number], 'id' | 'term'> & {term: SearchQueryTermForReduxOmitId[]}
export type SearchQueryForReduxOmitId = DistributiveOmit<SearchQueryForRedux, 'id' | 'term'> & {term: SearchQueryAndTermForReduxOmitId[]}
