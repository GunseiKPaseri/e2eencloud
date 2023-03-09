import { prisma } from 'tinyserver/src/client/dbclient.ts';
import type { OakSessionStore } from 'tinyserver/deps.ts';
import { SessionData } from 'tinyserver/deps.ts';
import { omit } from 'tinyserver/src/utils/objSubset.ts';

interface AppSessionData extends SessionData {
  _flash: Record<string, unknown>;
  _accessed: string | null;
  _expire: string | null;
  client_name?: string;
  [key: string]: unknown;
}

interface ResultSelectIDDataFromSession {
  id: string;
  data: string;
}

interface ResultSelectIDDataUserIdFromSession {
  id: string;
  data: string;
  user_id: number;
}

const sessionStringify = (session: AppSessionData) => {
  return {
    id: session.id as string,
    user_id: session.uid as string,
    data: JSON.stringify(omit(session, ['id', 'uid'])),
  };
};

const sessionParse = (input: {
  id: string;
  user_id: string | null;
  data: string;
}): AppSessionData => {
  return {
    id: input.id,
    uid: input.user_id,
    ...JSON.parse(input.data),
  };
};

class SessionsStore implements OakSessionStore {
  tableName: string;

  constructor(tableName = 'sessions') {
    this.tableName = tableName;
  }

  async sessionExists(sessionKey: string) {
    console.log('ex', sessionKey);
    const session = await prisma.sessions.findFirst({
      select: {
        id: true,
      },
      where: {
        session_key: sessionKey,
      },
    });
    return session !== null ? true : false;
  }

  async getSessionById(sessionKey: string): Promise<AppSessionData | null> {
    console.log('byid', sessionKey);
    const session = await prisma.sessions.findUnique({
      select: {
        id: true,
        data: true,
        user_id: true,
      },
      where: {
        session_key: sessionKey,
      },
    });
    if (session === null) return null;
    return sessionParse(session);
  }

  async createSession(sessionKey: string, initialData: AppSessionData) {
    console.log('cr', sessionKey);
    await prisma.sessions.create({
      data: {
        ...sessionStringify(initialData),
        id: crypto.randomUUID(),
        session_key: sessionKey,
        // session expired_at tomorrow
        expired_at: new Date(Date.now() + 86400),
      },
    });
  }

  async deleteSession(sessionKey: string) {
    console.log('dl', sessionKey);
    await prisma.sessions.delete({
      where: {
        session_key: sessionKey,
      },
    });
  }

  async deleteSessionById(id: string, user_id: string) {
    console.log('uid', id);
    await prisma.sessions.deleteMany({
      where: {
        id,
        user_id,
      },
    });
  }

  async persistSessionData(sessionKey: string, sessionData: AppSessionData) {
    console.log('pe', sessionKey);
    await prisma.sessions.update({
      where: {
        session_key: sessionKey,
      },
      data: omit(sessionStringify(sessionData), ['id']),
    });
  }

  async persistSessionDataById(id: string, sessionData: AppSessionData) {
    console.log('pe', id);
    await prisma.sessions.update({
      data: omit(sessionStringify(sessionData), ['id']),
      where: {
        id: id,
      },
    });
  }

  async getSessionsByUserId(userId: string) {
    console.log('get', userId);
    const sessions = await prisma.sessions.findMany({
      select: {
        id: true,
        data: true,
        user_id: true,
      },
      where: {
        user_id: userId,
      },
    });
    return sessions.map((x) => sessionParse(x));
  }

  async getSessionByUniqueId(id: string) {
    console.log('id', id);
    const session = await prisma.sessions.findUnique({
      select: {
        id: true,
        data: true,
        user_id: true,
      },
      where: {
        id: id,
      },
    });
    if (session === null) return null;
    return sessionParse(session);
  }
}

const sessionStore = new SessionsStore();
export default sessionStore;
