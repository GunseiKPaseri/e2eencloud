import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  changeClientNameAsync, deleteSessionAsync, getSessionsAsync, SessionsState,
} from './sessionSlice';

function NameChanger({ id, name }:{ id: string, name: string }) {
  const [newName, setNewName] = useState(name);
  const dispatch = useAppDispatch();
  const handleClick = () => {
    dispatch(changeClientNameAsync({ id, newClientName: newName }));
  };

  useEffect(() => {
    setNewName(name);
  }, [name]);

  return (
    <>
      <input value={name} onChange={(e) => setNewName(e.target.value)} />
      <button type="button" onClick={handleClick}>変更</button>
    </>
  );
}

function SessionConfig() {
  const dispatch = useAppDispatch();
  const sessionState = useAppSelector<SessionsState>((store) => store.session);
  // const selector = useAppSelector<FileState>((state) => state.file)

  const getSession = () => {
    dispatch(getSessionsAsync());
  };

  if (sessionState.sessions.length === 0 && !sessionState.loading) getSession();

  return (
    <article>
      <h2>セッション</h2>
      <button type="button" onClick={getSession}>更新</button>
      <table>
        <thead>
          <tr>
            <th>自己</th>
            <th>クライアント名</th>
            <th>削除</th>
          </tr>
        </thead>
        <tbody>
          {sessionState.sessions.map((x) => (
            <tr key={x.id}>
              <td>{x.isMe ? '◎' : ''}</td>
              <td>{x.isMe ? <NameChanger id={x.id} name={x.clientName} /> : x.clientName}</td>
              <td>
                <button type="button" onClick={() => dispatch(deleteSessionAsync({ id: x.id }))}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

export default SessionConfig;
