import type { AnyAction } from '@reduxjs/toolkit';
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import type { ThunkDispatch } from 'redux-thunk';
import type { RootState } from '~/store/store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TypedDispatch<T> = ThunkDispatch<T, any, AnyAction>;

export const useAppDispatch = () => useDispatch<TypedDispatch<RootState>>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
