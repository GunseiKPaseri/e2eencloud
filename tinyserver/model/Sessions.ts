import { Client } from 'https://deno.land/x/mysql/mod.ts';
import Store from 'https://deno.land/x/oak_sessions@v3.2.3/src/stores/Store.ts';
import { SessionData } from 'https://deno.land/x/oak_sessions@v3.2.3/src/Session.ts';

export default class SessionsStore implements Store {
  db: Client;
  tableName: string;

  constructor(db: Client, tableName = 'sessions') {
    this.db = db;
    this.tableName = tableName;
    this.db.query(`CREATE TABLE IF NOT EXISTS ${this.tableName}(
        id VARCHAR(36) UNIQUE NOT NULL,
        data TEXT NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX(id)
    )`);
  }

  async sessionExists(sessionId: string) {
    const sessions = await this.db.query(
      `SELECT data FROM ${this.tableName} WHERE id = ?`,
      [sessionId],
    );
    return sessions.length > 0 ? true : false;
  }

  async getSessionById(sessionId: string): Promise<SessionData | null> {
    const sessions = await this.db.query(
      `SELECT data FROM ${this.tableName} WHERE id = ?`,
      [sessionId],
    );
    return sessions.length !== 1 ? null : JSON.parse(sessions[0].data);
  }

  async createSession(sessionId: string, initialData: SessionData) {
    await this.db.query(
      `INSERT INTO ${this.tableName} (id, data) VALUES (?, ?)`,
      [sessionId, JSON.stringify(initialData)],
    );
  }

  async deleteSession(sessionId: string) {
    await this.db.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [
      sessionId,
    ]);
  }

  async persistSessionData(sessionId: string, sessionData: SessionData) {
    await this.db.query(`UPDATE ${this.tableName} SET data = ? WHERE id = ?`, [
      JSON.stringify(sessionData),
      sessionId,
    ]);
  }
}
