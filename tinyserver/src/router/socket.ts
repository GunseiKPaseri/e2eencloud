import { getCookies, SocketIOServer } from 'tinyserver/deps.ts';
import sessionStore from 'tinyserver/src/model/Sessions.ts';
import { prisma } from 'tinyserver/src/client/dbclient.ts';

const io = new SocketIOServer({
  path: '/api/socket.io/',
  cors: {
    origin: 'http://app.localhost',
    methods: ['GET', 'POST'],
  },
});

localStorage.debug = '*';

// リーダーを決定・情報を配布する
const decideExclCtrl = async (uid: string, leader: string) => {
  io.to(`user:${uid}`).emit('DECIDED_EXCLCTRL', { leader });
  await prisma.user.update({ data: { leader_socket: leader }, where: { id: uid } });
};
// リーダーを交代する
const changeLeader = async (uid: string) => {
  const leeaderCandidate = io.of('/').adapter.rooms.get(`user:${uid}`);
  if (leeaderCandidate !== undefined) {
    const leeader = leeaderCandidate[Symbol.iterator]().next().value;
    await decideExclCtrl(uid, leeader);
  }
};

io.on('connection', (socket) => {
  // DEBUG
  setTimeout(() => {
    socket.emit('greeting', 'hello', 'world');
  }, 1000);

  socket.on('LOGGED_IN', async () => {
    const cookies = getCookies(socket.handshake.headers);
    const session = await sessionStore.getSessionById(cookies['session']);
    if (session === null || session.uid === undefined || session.uid === null) return;
    socket.join(`user:${session.uid}`);
    if ((io.of('/').adapter.rooms.get(`user:${session.uid}`)?.size ?? 0) === 1) {
      await decideExclCtrl('' + session.uid, socket.id);
    }
  });

  socket.on('LOGGED_OUT', async () => {
    const cookies = getCookies(socket.handshake.headers);
    const session = await sessionStore.getSessionById(cookies['session']);
    if (session === null) return;
    socket.leave(`user:${session.uid}`);
    await changeLeader('' + session.uid);
  });

  socket.on('REQUEST_EXCLCTRL', async () => {
    const cookies = getCookies(socket.handshake.headers);
    const session = await sessionStore.getSessionById(cookies['session']);
    if (session === null) return;
    await decideExclCtrl('' + session.uid, socket.id);
  });

  socket.on('disconnect', async (reason) => {
    const cookies = getCookies(socket.handshake.headers);
    const session = await sessionStore.getSessionById(cookies['session']);
    if (session !== null) {
      const sessionLeader = await prisma.user.findUnique({
        where: { id: '' + session.uid },
        select: { leader_socket: true },
      });
      if (sessionLeader !== null && sessionLeader.leader_socket === socket.id) {
        await changeLeader('' + session.uid);
      }
    }
  });
});

io.of('/').adapter.on('leave-room', (room, id) => {
});

export default io;
