import React, { ReactNode } from 'react'

type ParentComponent = React.ComponentType<{children: ReactNode}>

/**
 * 引数の要素を入れ子にする
 * @param components 1つ以上の要素
 * @returns 
 */
export const composeComponents = (...components: [ParentComponent, ...ParentComponent[]]):ParentComponent => {
  if(components.length === 1) components[0]
  return components.reduce((Acc, Cur) => (props) => <Acc><Cur {...props} /></Acc>)
}