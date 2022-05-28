import { Where } from '../deps.ts';
import { ExhaustiveError } from '../util.ts';

type EasyFilterItemCore<T extends string> = {
  readonly columnField: T;
  readonly value?: string | string[];
  readonly operatorValue: string;
};

// union distribution
type EasyFilterItem<T extends string> = T extends string ? EasyFilterItemCore<T> : never;

export const easyIsFilterItem = <T extends string>(item: unknown): item is EasyFilterItem<T> => {
  if (typeof item !== 'object' || item === null) return false;
  const partialItem: Partial<EasyFilterItem<T>> = item;
  return (
    typeof partialItem.columnField === 'string' &&
    (
      typeof partialItem.value === 'undefined' ||
      typeof partialItem.value === 'string' ||
      (Array.isArray(partialItem.value) && partialItem.value.every((x) => typeof x === 'string'))
    ) &&
    typeof partialItem.operatorValue === 'string'
  );
};

const filterOperatorsBoolean = ['is'] as const;
export type FilterOperatorBoolean = typeof filterOperatorsBoolean[number];
export const isFilterOperatorBoolean = (field: string): field is FilterOperatorBoolean => {
  return filterOperatorsBoolean.some((value) => value === field);
};
export type FilterBooleanItem<T extends string> = {
  columnField: T;
  value: 'any' | 'true' | 'false';
  operatorValue: FilterOperatorBoolean;
};
export const isFilterBooleanItem = <T extends string>(
  item: { columnField: T; value?: unknown; operatorValue: unknown },
): item is FilterBooleanItem<T> => {
  if (typeof item.operatorValue !== 'string' || !isFilterOperatorBoolean(item.operatorValue)) return false;
  return item.value === 'true' || item.value === 'false' || item.value === 'any';
};

const filterOperatorsNumber = ['=', '!=', '>', '>=', '<', '<=', 'isEmpty', 'isNotEmpty', 'isAnyOf'] as const;
export type FilterOperatorNumber = typeof filterOperatorsNumber[number];
export const isFilterOperatorNumber = (field: string): field is FilterOperatorNumber => {
  return filterOperatorsNumber.some((value) => value === field);
};
export type FilterNumberItem<T extends string> = {
  columnField: T;
  value: string;
  operatorValue: Exclude<FilterOperatorNumber, 'isAnyOf' | 'isEmpty' | 'isNotEmpty'>;
} | {
  columnField: T;
  value: string[];
  operatorValue: 'isAnyOf';
} | {
  columnField: T;
  operatorValue: 'isEmpty' | 'isNotEmpty';
};

export const isFilterNumberItem = <T extends string>(
  item: { columnField: T; value?: unknown; operatorValue: unknown },
): item is FilterNumberItem<T> => {
  if (typeof item.operatorValue !== 'string' || !isFilterOperatorNumber(item.operatorValue)) return false;
  if (item.operatorValue === 'isEmpty' || item.operatorValue === 'isNotEmpty') return true;
  return (
    (item.operatorValue === 'isAnyOf' && Array.isArray(item.value)) && item.value.every((x) => typeof x === 'string') ||
    (item.operatorValue !== 'isAnyOf' && typeof item.value === 'string')
  );
};

const filterOperatorsString = [
  'contains',
  'equals',
  'startsWith',
  'endsWith',
  'isEmpty',
  'isNotEmpty',
  'isAnyOf',
] as const;
export type FilterOperatorString = typeof filterOperatorsString[number];
export const isFilterOperatorString = (field: string): field is FilterOperatorString => {
  return filterOperatorsString.some((value) => value === field);
};

export type FilterStringItem<T extends string> = {
  columnField: T;
  value: string;
  operatorValue: Exclude<FilterOperatorString, 'isAnyOf' | 'isEmpty' | 'isNotEmpty'>;
} | {
  columnField: T;
  value: string[];
  operatorValue: 'isAnyOf';
} | {
  columnField: T;
  operatorValue: 'isEmpty' | 'isNotEmpty';
};

export const isFilterStringItem = <T extends string>(
  item: { columnField: T; value?: unknown; operatorValue: unknown },
): item is FilterStringItem<T> => {
  if (typeof item.operatorValue !== 'string' || !isFilterOperatorString(item.operatorValue)) return false;
  if (item.operatorValue === 'isEmpty' || item.operatorValue === 'isNotEmpty') return true;
  return (
    (item.operatorValue === 'isAnyOf' && Array.isArray(item.value)) && item.value.every((x) => typeof x === 'string') ||
    (item.operatorValue !== 'isAnyOf' && typeof item.value === 'string')
  );
};

const filterOperatorsDate = [
  'is',
  'not',
  'after',
  'onOrAfter',
  'before',
  'onOrBefore',
  'isEmpty',
  'isNotEmpty',
] as const;
export type FilterOperatorDate = typeof filterOperatorsDate[number];
export const isFilterOperatorDate = (field: string): field is FilterOperatorDate => {
  return filterOperatorsDate.some((value) => value === field);
};
export type FilterDateItem<T extends string> = {
  columnField: T;
  value: string;
  operatorValue: Exclude<FilterOperatorDate, 'isEmpty' | 'isNotEmpty'>;
} | {
  columnField: T;
  operatorValue: 'isEmpty' | 'isNotEmpty';
};
export const isFilteDateItem = <T extends string>(
  item: { columnField: T; value?: unknown; operatorValue: unknown },
): item is FilterStringItem<T> => {
  if (typeof item.operatorValue !== 'string' || !isFilterOperatorDate(item.operatorValue)) return false;
  if (item.operatorValue === 'isEmpty' || item.operatorValue === 'isNotEmpty') return true;
  return (typeof item.value === 'string');
};

type GridFilterModelItem<T extends string> =
  | FilterBooleanItem<T>
  | FilterNumberItem<T>
  | FilterStringItem<T>
  | FilterDateItem<T>;

interface GridFilterModel {
  items: GridFilterModelItem<string>[];
  linkOperator: 'and' | 'or';
}

export const filterModelToSQLWhereObj = (filterModel: GridFilterModel) => {
  const terms = filterModel.items.map((x) => {
    switch (x.operatorValue) {
      // number
      case '!=':
        return Where.ne(x.columnField, Number(x.value));
      case '<':
        return Where.lt(x.columnField, Number(x.value));
      case '<=':
        return Where.lte(x.columnField, Number(x.value));
      case '>':
        return Where.gt(x.columnField, Number(x.value));
      case '>=':
        return Where.gte(x.columnField, Number(x.value));
      case '=':
        return Where.eq(x.columnField, Number(x.value));
      // string
      case 'contains':
        return Where.like(x.columnField, `%${x.value}%`);
      case 'equals':
        return Where.like(x.columnField, x.value);
      case 'startsWith':
        return Where.like(x.columnField, `${x.value}%`);
      case 'endsWith':
        return Where.like(x.columnField, `%${x.value}`);
      // boolean
      case 'is':
        return x.value === 'true'
          ? Where.eq(x.columnField, true)
          : x.value === 'false'
          ? Where.eq(x.columnField, false)
          : null;
      // date
      case 'not':
        return Where.ne(x.columnField, x.value);
      case 'before':
        return Where.lt(x.columnField, x.value);
      case 'onOrBefore':
        return Where.lte(x.columnField, x.value);
      case 'after':
        return Where.gt(x.columnField, x.value);
      case 'onOrAfter':
        return Where.gte(x.columnField, x.value);
      case 'isEmpty':
        return Where.isNull(x.columnField);
      case 'isNotEmpty':
        // return Where.isNotNull(x.columnField); // has bug
        return Where.expr('?? IS NOT NULL', x.columnField);
      case 'isAnyOf':
        return x.value.length > 0 ? Where.in(x.columnField, x.value) : null;
      default:
        throw new ExhaustiveError(x);
    }
  });
  return filterModel.linkOperator === 'and' ? Where.and(...terms) : Where.or(...terms);
};
