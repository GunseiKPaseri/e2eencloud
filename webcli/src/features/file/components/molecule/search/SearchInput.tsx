import type { MouseEventHandler, MutableRefObject, ReactElement } from 'react';
import { cloneElement, useCallback, useEffect, useRef, useState } from 'react';
import type { CollisionDetection, UniqueIdentifier } from '@dnd-kit/core';
import {
  DndContext,
  useSensor,
  MouseSensor,
  KeyboardSensor,
  useSensors,
  TouchSensor,
  closestCenter,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  MeasuringStrategy,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { type SxProps, type Theme } from '@mui/system';
import { useAppDispatch, useAppSelector } from '~/lib/react-redux';
import { changeActiveFileGroupSearch } from '~/features/file/fileSlice';
import {
  hasById,
  indexOfById,
  searchTerm,
  searchTermById,
} from '~/features/file/util/search';
import type { SearchQueryAndTermForRedux } from '../../../util/search.type';
import {
  type SearchQueryForRedux,
  type SearchQuerySetForRedux,
} from '../../../util/search.type';
import KeyWordChip, {
  type QueryKeyWordChipProps,
} from '../../atom/search/QueryKeyWordChip';
import QueryKeyWordLabel from '../../atom/search/QueryKeyWordLabel';
import TermGroupBox from '../../atom/search/TermGroupBox';
import AddQueryDialog from './AddQueryDialog';

type KeyWordChipSortableProps = Omit<QueryKeyWordChipProps, 'isDragging'> & {
  id: string;
};
const KeyWordChipSortable = (props: KeyWordChipSortableProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
    transition,
  } = useSortable({
    id: props.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 1 : 0,
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      {...listeners}
      {...attributes}
    >
      <KeyWordChip {...props} isDragging={isDragging} />
    </div>
  );
};

type QuerySetBuilderProps = {
  querySet: SearchQuerySetForRedux;
  parentIgnore: boolean;
  onDelete?: (querySet: SearchQuerySetForRedux) => void;
  id: string;
  overlay?: boolean;
};
const QuerySetBuilder = ({
  querySet,
  onDelete,
  parentIgnore,
  ...props
}: QuerySetBuilderProps) => {
  const ignore = parentIgnore || (querySet.ignore ?? false);
  const keyWordProps = {
    ...props,
    ignore,
    onDelete: onDelete ? () => onDelete(querySet) : () => undefined,
    label: <QueryKeyWordLabel querySet={querySet} />,
  };
  return <KeyWordChipSortable {...keyWordProps} />;
};

const AddButton = (props: {
  onClick: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}) => {
  return (
    <Button
      onClick={props.onClick}
      variant='outlined'
      fullWidth
      disabled={props.disabled}
      sx={{
        '&.Mui-disabled': {
          borderStyle: 'dashed',
          borderColor: 'black',
          color: 'black',
        },
      }}
    >
      {props.disabled ? '新しい項目を追加' : <AddIcon />}
    </Button>
  );
};

const TRASH_ID = 'void';
const PLACEHOLDER_ID = 'placeholder';

/**
 * Custom collision detection strategy optimized for multiple containers
 *
 * - First, find any droppable containers intersecting with the pointer.
 * - If there are none, find intersecting containers with the active draggable.
 * - If there are no intersecting containers, return the last matched intersection
 *
 */
const collisionDetectionStrategyGenerator =
  ({
    activeId,
    items,
    lastOverItem,
    recentlyMovedToNewContainer,
  }: {
    activeId: UniqueIdentifier | null;
    items: SearchQueryForRedux;
    lastOverItem: MutableRefObject<UniqueIdentifier | null>;
    recentlyMovedToNewContainer: MutableRefObject<boolean | null>;
  }): CollisionDetection =>
  (args) => {
    if (activeId && activeId in items) {
      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter(
          (container) => container.id in items,
        ),
      });
    }

    // Start by finding any intersecting droppable
    const pointerIntersections = pointerWithin(args);
    const intersections =
      pointerIntersections.length > 0
        ? // If there are droppables intersecting with the pointer, return those
          pointerIntersections
        : rectIntersection(args);
    let overId = getFirstCollision(intersections, 'id');

    if (overId != null) {
      if (overId === TRASH_ID) {
        // If the intersecting droppable is the trash, return early
        // Remove this if you're not using trashable functionality in your app
        return intersections;
      }

      const containerItems = searchTermById(items, overId);
      if (containerItems !== undefined) {
        // If a container is matched and it contains items (columns 'A', 'B', 'C')
        if (containerItems && containerItems.term.length > 0) {
          // Return the closest droppable within that container
          overId = closestCenter({
            ...args,

            droppableContainers: args.droppableContainers.filter(
              (container) =>
                container.id !== overId &&
                hasById(containerItems, container.id),
            ),
          })[0]?.id;
        }
      }

      lastOverItem.current = overId;

      return [{ id: overId }];
    }

    // When a draggable item moves to a new container, the layout may shift
    // and the `overId` may become `null`. We manually set the cached `lastOverId`
    // to the id of the draggable item that was moved to the new container, otherwise
    // the previous `overId` will be returned which can cause items to incorrectly shift positions
    if (recentlyMovedToNewContainer.current) {
      lastOverItem.current = activeId;
    }

    // If no droppable is matched, return the last match
    return lastOverItem.current ? [{ id: lastOverItem.current }] : [];
  };

const Placeholder = (props: { children: ReactElement }) => {
  const { isOver, setNodeRef } = useDroppable({ id: PLACEHOLDER_ID });
  const newChildren = cloneElement(props.children, { disabled: isOver });
  return (
    <div
      ref={setNodeRef}
      style={{
        opacity: isOver ? 0.5 : undefined,
      }}
    >
      {newChildren}
    </div>
  );
};

// dnd kit custom sensor
const useCustomSensor = () => {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const touchSensor = useSensor(TouchSensor);
  return useSensors(mouseSensor, touchSensor, keyboardSensor);
};

function LichSearchInput(props: {
  onOpenAddQueryDialog: (key: string) => void;
}) {
  const { onOpenAddQueryDialog } = props;
  const sensors = useCustomSensor();

  const dispatch = useAppDispatch();
  const activeFileGroup = useAppSelector((store) => store.file.activeFileGroup);
  const searchQueryItemOrigin =
    activeFileGroup?.type === 'search' ? activeFileGroup.query : null;
  const [searchQueryItem, setSearchQueryItem] = useState(searchQueryItemOrigin);

  useEffect(() => {
    setSearchQueryItem(searchQueryItemOrigin);
  }, [searchQueryItemOrigin]);

  const [dndActiveItem, setDndActiveItem] = useState<UniqueIdentifier | null>(
    null,
  );
  const lastOverItem = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef<boolean | null>(null);
  // const isSortingContainer = dndActiveItem && searchQueryItem
  //   ? hasSearchQuerySet(searchQueryItem, dndActiveItem)
  //   : false

  const collisionDetectionStrategy = useCallback(
    collisionDetectionStrategyGenerator({
      activeId: dndActiveItem,
      items: searchQueryItem ?? { term: [], id: '' },
      lastOverItem,
      recentlyMovedToNewContainer,
    }),
    [dndActiveItem, searchQueryItem],
  );
  const [clonedItems, setClonedItems] = useState<SearchQueryForRedux | null>(
    null,
  );

  const changeQuery = (afterQuery: SearchQueryForRedux) => {
    dispatch(changeActiveFileGroupSearch({ query: afterQuery }));
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [searchQueryItem]);

  const AddQueryButton = (props: {
    targetQuery: string;
    disabled?: boolean;
  }) => (
    <AddButton
      disabled={props.disabled}
      onClick={() => onOpenAddQueryDialog(props.targetQuery)}
    />
  );
  const OrSectionBuilder = ({
    andSection,
    onRefresh,
    parentIgnore,
  }: {
    andSection: SearchQueryAndTermForRedux;
    onRefresh: (andSection: SearchQueryAndTermForRedux) => void;
    parentIgnore: boolean;
  }) => {
    const onQuerySetDelete = (deletedQuerySet: SearchQuerySetForRedux) => {
      onRefresh({
        ...andSection,
        term: andSection.term.filter(
          (querySet) => querySet.id !== deletedQuerySet.id,
        ),
      });
    };
    const ignore = parentIgnore || (andSection.ignore ?? false);
    const dndActiveTerm =
      typeof dndActiveItem === 'string'
        ? searchTermById(andSection, dndActiveItem)
        : undefined;
    return (
      <TermGroupBox
        disabled={ignore}
        header='以下の全てを満たす'
        addButton={<AddQueryButton targetQuery={andSection.id} />}
      >
        <SortableContext
          items={[...andSection.term]}
          strategy={verticalListSortingStrategy}
        >
          {andSection.term.map((querySet) => (
            <QuerySetBuilder
              parentIgnore={ignore}
              key={querySet.id}
              id={querySet.id}
              querySet={querySet}
              onDelete={onQuerySetDelete}
              overlay={querySet.id === dndActiveTerm?.id}
            />
          ))}
          {
            <DragOverlay>
              {dndActiveTerm ? (
                <QuerySetBuilder
                  parentIgnore={ignore}
                  key='dragoverlay'
                  id='dragoverlay'
                  querySet={dndActiveTerm}
                  onDelete={onQuerySetDelete}
                />
              ) : null}
            </DragOverlay>
          }
          {andSection.term.length === 0 ? (
            <div style={{ width: 10, height: 50 }}></div>
          ) : (
            <></>
          )}
        </SortableContext>
      </TermGroupBox>
    );
  };

  const ignore = searchQueryItem?.ignore ?? false;
  return (
    <Card>
      {searchQueryItem === null || searchQueryItem.term.length === 0 ? (
        <AddQueryButton targetQuery='' />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always,
            },
          }}
          onDragStart={({ active }) => {
            setDndActiveItem(active.id);
            setClonedItems(searchQueryItem);
          }}
          onDragOver={({ active, over }) => {
            const overId = over?.id;
            if (
              !overId ||
              overId === TRASH_ID ||
              searchTermById(searchQueryItem, active.id)
            ) {
              return;
            }
            const overOrTerm = searchTerm(searchQueryItem, overId);
            const activeOrTerm = searchTerm(searchQueryItem, active.id);
            if (!overOrTerm || !activeOrTerm) {
              return;
            }
            if (overOrTerm !== activeOrTerm) {
              setSearchQueryItem((beforeSearchQuery) => {
                const activeTerm =
                  beforeSearchQuery &&
                  searchTermById(beforeSearchQuery, activeOrTerm.id);
                const overTerm =
                  beforeSearchQuery &&
                  searchTermById(beforeSearchQuery, overOrTerm.id);
                if (!overTerm || !activeTerm) return null;
                const activeIndex = activeTerm
                  ? indexOfById(activeTerm, active.id)
                  : -1;
                const overIndex = indexOfById(overTerm, overId);

                let newIndex: number;
                if (hasById(overTerm, overId)) {
                  newIndex = overTerm.term.length + 1;
                } else {
                  const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top >
                      over.rect.top + over.rect.height;

                  const modifier = isBelowOverItem ? 1 : 0;

                  newIndex =
                    overIndex >= 0
                      ? overIndex + modifier
                      : overTerm.term.length + 1;
                }

                recentlyMovedToNewContainer.current = true;

                return {
                  ...beforeSearchQuery,
                  term: beforeSearchQuery.term.map((orTerm) => {
                    if (orTerm.id === activeTerm.id) {
                      return {
                        ...orTerm,
                        term: orTerm.term.filter(
                          (andTerm) => andTerm.id !== active.id,
                        ),
                      };
                    } else if (orTerm.id === overTerm.id) {
                      return {
                        ...orTerm,
                        term: [
                          ...orTerm.term.slice(0, newIndex),
                          activeTerm.term[activeIndex],
                          ...orTerm.term.slice(newIndex),
                        ],
                      };
                    }
                    return orTerm;
                  }),
                };
              });
            }
          }}
          onDragEnd={({ active, over }) => {
            const activeContainer = searchTerm(searchQueryItem, active.id);
            console.log(active, over, activeContainer);

            if (!activeContainer) {
              setDndActiveItem(null);
              return;
            }

            const overId = over?.id;

            if (overId == null) {
              setDndActiveItem(null);
              return;
            }

            if (overId === TRASH_ID) {
              changeQuery({
                ...searchQueryItem,
                term: searchQueryItem.term.map((x) =>
                  x.id === activeContainer.id
                    ? {
                        ...x,
                        term: x.term.filter((y) => y.id !== active.id),
                      }
                    : x,
                ),
              });
              setDndActiveItem(null);
              return;
            }

            if (overId === PLACEHOLDER_ID) {
              const activeTerm = searchTermById(activeContainer, active.id);
              if (activeTerm) {
                setDndActiveItem(null);
                changeQuery({
                  ...searchQueryItem,
                  term: [
                    ...searchQueryItem.term.map((x) =>
                      x.id === activeContainer.id
                        ? {
                            ...x,
                            term: x.term.filter((y) => y.id !== active.id),
                          }
                        : x,
                    ),
                    { id: '', term: [activeTerm] },
                  ],
                });
              }
              return;
            }

            const overContainer = searchTerm(searchQueryItem, overId);

            if (overContainer) {
              const activeIndex = indexOfById(activeContainer, active.id);
              const overIndex = indexOfById(overContainer, overId);
              const afterSearchQueryItem =
                activeIndex !== overIndex
                  ? searchQueryItem
                    ? {
                        ...searchQueryItem,
                        term: searchQueryItem.term.map((x) =>
                          x.id === overContainer.id
                            ? {
                                ...x,
                                term: arrayMove(x.term, activeIndex, overIndex),
                              }
                            : x,
                        ),
                      }
                    : null
                  : searchQueryItem;
              afterSearchQueryItem && changeQuery(afterSearchQueryItem);
            }
            setDndActiveItem(null);
          }}
          onDragCancel={() => {
            if (clonedItems) {
              setSearchQueryItem(clonedItems);
            }
            setDndActiveItem(null);
            setClonedItems(null);
          }}
        >
          <TermGroupBox
            disabled={ignore}
            header='以下のいずれかを満たす'
            addButton={
              <Placeholder>
                <AddQueryButton targetQuery='' />
              </Placeholder>
            }
          >
            {searchQueryItem.term.map((querySet, i) => (
              <OrSectionBuilder
                key={querySet.id}
                parentIgnore={ignore}
                andSection={querySet}
                onRefresh={(afterSection) => {
                  const newSearchQueryItem = [...searchQueryItem.term];
                  newSearchQueryItem.splice(i, 1, afterSection);
                  console.log(newSearchQueryItem);
                  changeQuery({ ...searchQueryItem, term: newSearchQueryItem });
                }}
              />
            ))}
          </TermGroupBox>
        </DndContext>
      )}
    </Card>
  );
}

function SearchInput(props: { sx?: SxProps<Theme> }) {
  const dispatch = useAppDispatch();
  const activeFileGroup = useAppSelector((state) => state.file.activeFileGroup);
  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [openAddQueryDialog, setOpenAddQueryDialog] = useState(false);
  const [addQueryDialogTarget, setAddQueryDialogTarget] = useState('');
  return (
    <>
      <IconButton onClick={() => setOpenSearchDialog(true)}>
        <SearchIcon />
      </IconButton>
      <Dialog
        onClose={() => setOpenSearchDialog(false)}
        open={openSearchDialog}
      >
        <LichSearchInput
          onOpenAddQueryDialog={(key) => {
            setAddQueryDialogTarget(key);
            setOpenAddQueryDialog(true);
          }}
        />
        <TextField
          sx={props.sx}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          error={
            activeFileGroup?.type === 'search' && activeFileGroup.queryHasError
          }
          value={
            activeFileGroup?.type === 'search'
              ? activeFileGroup.queryString
              : ''
          }
          variant='standard'
          onChange={(e) => {
            dispatch(
              changeActiveFileGroupSearch({ queryString: e.target.value }),
            );
          }}
        />
      </Dialog>
      <AddQueryDialog
        onAddQuery={(query) => {
          const newQuery: SearchQueryForRedux['term'] =
            activeFileGroup?.type == 'search'
              ? activeFileGroup.query.term.map((x) => ({
                  ...x,
                  term:
                    x.id === addQueryDialogTarget ? [...x.term, query] : x.term,
                }))
              : [{ term: [], id: 'added' }];
          dispatch(
            changeActiveFileGroupSearch({
              query: {
                ...query,
                term:
                  addQueryDialogTarget === ''
                    ? [...newQuery, { term: [query], id: 'added' }]
                    : newQuery,
              },
            }),
          );
        }}
        onClose={() => setOpenAddQueryDialog(false)}
        open={openAddQueryDialog}
      />
    </>
  );
}

export default SearchInput;
