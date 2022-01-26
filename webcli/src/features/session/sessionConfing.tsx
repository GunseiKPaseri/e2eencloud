import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { changeClientNameAsync, deleteSessionAsync, getSessionsAsync } from './sessionSlice'

const NameChanger = (params:{id: string, name: string}) => {
  const [name, setName] = useState(params.name)
  const dispatch = useAppDispatch()
  const handleClick = () => {
    dispatch(changeClientNameAsync({ id: params.id, newClientName: name }))
  }

  useEffect(() => {
    setName(params.name)
  }, [params.name])

  return (
    <>
      <input value={name} onChange={(e) => setName(e.target.value)}/>
      <button onClick={handleClick}>変更</button>
    </>
  )
}

export const SessionConfig = () => {
  const dispatch = useAppDispatch()
  const sessionState = useAppSelector((store) => store.session)
  // const selector = useAppSelector<FileState>((state) => state.file)

  const getSession = () => {
    dispatch(getSessionsAsync())
  }

  if (sessionState.sessions.length === 0 && !sessionState.loading) getSession()

  return (
    <article>
      <h2>セッション</h2>
      <button onClick={getSession}>更新</button>
      <table>
        <thead>
          <tr><th></th><th>クライアント名</th><th>削除</th></tr>
        </thead>
        <tbody>
          {sessionState.sessions.map(x =>
            <tr key={x.id}>
              <td>{x.isMe ? '◎' : ''}</td>
              <td>{x.isMe ? <NameChanger id={x.id} name={x.clientName}/> : x.clientName}</td>
              <td><button onClick={() => dispatch(deleteSessionAsync({ id: x.id }))}>削除</button></td>
            </tr>
          )}
        </tbody>
      </table>
    </article>
  )
}
