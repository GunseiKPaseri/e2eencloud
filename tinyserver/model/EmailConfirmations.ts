import client from '../dbclient.ts';

export class EmailConfirmation{
  readonly email: string;
  readonly email_confirmation_token: string;
  readonly expired_at: Date;
  constructor(email: string, email_confirmation_token: string, expired_at: Date) {
    this.email = email;
    this.email_confirmation_token = email_confirmation_token;
    this.expired_at = expired_at;
  }
}

export const addEmailConfirmation = async (email: string, email_confirmation_token: string) => {
  // 一時間後に無効化
  const expired_at = new Date(Date.now());
  expired_at.setHours(expired_at.getHours() + 1);
  await client.execute(`INSERT INTO email_confirmations(
    email,
    email_confirmation_token,
    expired_at) values(?, ?, ?)`,
    [email, email_confirmation_token, expired_at]);

  const newEmailConfirmation=new EmailConfirmation(email, email_confirmation_token, expired_at);
  return newEmailConfirmation;
}

export const isEmailConfirmSuccess = async (email: string, email_confirmation_token: string) => {
  const emailConfirms = await client.query(`SELECT * FROM email_confirmations
    WHERE email = ?
    AND email_confirmation_token = ?
    AND expired_at > ?
    LIMIT 1`,
    [email, email_confirmation_token, new Date(Date.now())]);
  return emailConfirms.length > 0;
}

export const deleteEmailConfirm = async (email: string) => {
  await client.execute(`DELETE FROM email_confirmations WHERE email = ?`, [email]);
};

