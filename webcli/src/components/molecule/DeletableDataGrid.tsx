import type {
  DataGridProps,
  GridRowParams,
  GridSortItem,
  GridValidRowModel,
  GridFilterModel,
} from '@mui/x-data-grid';
import type { Namespace, TFunction } from 'i18next';
import EditableDataGrid from './EditableDataGrid';

type GetListJSON<T> = {
  total_number: number;
  items: T[];
};

export type ComputeMutation<
  T extends GridValidRowModel,
  N extends Namespace<'translations'> = 'translations',
  TKPrefix = undefined,
> = (params: {
  newRow: T;
  oldRow: T;
  t: TFunction<N, TKPrefix>;
}) => string | null;

function DeletableDataGrid<T extends GridValidRowModel>(
  props: Omit<DataGridProps<T>, 'rows'> & {
    getName: (params: GridRowParams<T>) => string;
    getList: (props: {
      offset: number;
      limit: number;
      sortQuery: GridSortItem[];
      filterQuery: GridFilterModel;
    }) => Promise<GetListJSON<T>>;
    onDelete: (props: GridRowParams<T>) => void;
    parentHeight: number;
    reloader?: symbol;
  },
) {
  const perfectProps = {
    computeMutation: () => null,
    onEditFailure: () => undefined,
    onEditSuccess: () => undefined,
    ...props,
  };
  return EditableDataGrid(perfectProps);
}

export default DeletableDataGrid;
