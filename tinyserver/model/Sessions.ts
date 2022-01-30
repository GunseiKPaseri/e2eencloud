import type { OakSessionStore } from '../deps.ts';
import { Client, SessionData } from '../deps.ts';
import client from '../dbclient.ts';
class SessionsStore implements OakSessionStore {
  db: Client;
  tableName: string;

  constructor(db: Client, tableName = 'sessions') {
    this.db = db;
    this.tableName = tableName;
  }

  async sessionExists(sessionKey: string) {
    const sessions = await this.db.query(
      `SELECT session_key FROM ${this.tableName} WHERE session_key = ?`,
      [sessionKey],
    );
    return sessions.length > 0 ? true : false;
  }

  async getSessionById(sessionKey: string): Promise<SessionData | null> {
    const sessions = await this.db.query(
      `SELECT id, data, user_id FROM ${this.tableName} WHERE session_key = ?`,
      [sessionKey],
    );
    if (sessions.length !== 1) return null;
    const sessionData: SessionData = JSON.parse(sessions[0].data);
    if (sessions[0].user_id) sessionData.uid = sessions[0].user_id;
    sessionData.id = sessions[0].id;
    return sessionData;
  }

  async createSession(sessionKey: string, initialData: SessionData) {
    const copied = { ...initialData };
    const uid = copied.uid;
    delete copied.uid;
    delete copied.id;
    await this.db.query(
      `INSERT INTO ${this.tableName} (id, session_key, data, user_id) VALUES (?, ?, ?, ?)`,
      [crypto.randomUUID(), sessionKey, JSON.stringify(copied), uid],
    );
  }

  async deleteSession(sessionKey: string) {
    await this.db.query(`DELETE FROM ${this.tableName} WHERE session_key = ?`, [
      sessionKey,
    ]);
  }

  async deleteSessionById(id: string, user_id: number) {
    await this.db.query(`DELETE FROM ${this.tableName} WHERE id = ? AND user_id = ?`, [
      id,
      user_id,
    ]);
  }

  async persistSessionData(sessionKey: string, sessionData: SessionData) {
    const copied = { ...sessionData };
    const uid = copied.uid;
    delete copied.uid;
    delete copied.id;
    await this.db.query(`UPDATE ${this.tableName} SET data = ?, user_id = ? WHERE session_key = ?`, [
      JSON.stringify(copied),
      uid,
      sessionKey,
    ]);
  }

  async persistSessionDataById(id: string, sessionData: SessionData) {
    const copied = { ...sessionData };
    const uid = copied.uid;
    delete copied.uid;
    delete copied.id;
    console.log(copied, uid, id);
    await this.db.query(`UPDATE ${this.tableName} SET data = ?, user_id = ? WHERE id = ?`, [
      JSON.stringify(copied),
      uid,
      id,
    ]);
    console.log(await this.db.query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]));
  }

  async getSessionsByUserId(userId: number) {
    const sessions: any[] = await this.db.query(`SELECT id, data FROM ${this.tableName} WHERE user_id = ?`, [
      userId,
    ]);
    return sessions.map((x): { id: string; data: SessionData } => ({ id: x.id, data: JSON.parse(x.data) }));
  }

  async getSessionByUniqueId(id: string) {
    const sessions: any[] = await this.db.query(`SELECT id, data, user_id FROM ${this.tableName} WHERE id = ?`, [
      id,
    ]);
    if (sessions.length !== 1) return null;
    const sessionData: SessionData = JSON.parse(sessions[0].data);
    if (sessions[0].user_id) sessionData.uid = sessions[0].user_id;
    sessionData.id = sessions[0].id;
    return sessionData;
  }
}

const sessionStore = new SessionsStore(client);
export default sessionStore;
