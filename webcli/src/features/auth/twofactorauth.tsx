import React, { useState, ReactElement } from 'react';
import { useAppDispatch, useAppSelector } from '../../../src/app/hooks';
import { AuthState, confirmEmailAsync } from './authSlice';

export const TowFactorAuth:React.FC = ():ReactElement => {
  const selector = useAppSelector<AuthState>((state) => state.auth);
  return (
    <article>
      {(selector.user?.useTowFactorAuth) ?
        <p>二段階認証を利用しています</p>
      : <p>二段階認証を利用していません</p>}
    </article>
  );
};