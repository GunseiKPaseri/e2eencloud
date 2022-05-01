import type { ReactNode } from 'react';
import React from 'react';

type ParentComponent = React.ComponentType<{ children: ReactNode }>;

/**
 * 引数の要素を入れ子にする
 * @param components 1つ以上の要素
 * @returns
 */
const composeComponents = (
  ...components: [ParentComponent, ...ParentComponent[]]
):ParentComponent => {
  if (components.length === 1) return components[0];
  // eslint-disable-next-line react/function-component-definition
  return components.reduce((Acc, Cur) => (props) => <Acc><Cur {...props} /></Acc>);
};

export default composeComponents;
