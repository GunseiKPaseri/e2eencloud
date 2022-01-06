import client from '../dbclient.ts';
import { deleteEmailConfirm, isEmailConfirmSuccess } from './EmailConfirmations.ts';

export class User{
  readonly email: string;
  readonly client_random_value: string;
  readonly encrypted_master_key: string;
  readonly hashed_authentication_key: string;
  private is_email_confirmed: boolean;
  constructor(email: string, client_random_value: string, encrypted_master_key: string, hashed_authentication_key: string) {
    this.email = email;
    this.client_random_value = client_random_value;
    this.encrypted_master_key = encrypted_master_key;
    this.hashed_authentication_key = hashed_authentication_key;
    this.is_email_confirmed = false;
  }
}

export const addUser = async (email: string, client_random_value: string, encrypted_master_key: string, hashed_authentication_key: string) => {
  try{
    await client.execute(`INSERT INTO users(
      email,
      client_random_value,
      encrypted_master_key,
      hashed_authentication_key,
      is_email_confirmed) values(?, ?, ?, ?, ?)`,
      [email, client_random_value, encrypted_master_key, hashed_authentication_key, false]);
  }catch (e){
    // ユーザが既に存在する
    const existUser = await client.query(`SELECT * FROM users WHERE email = ?`,
    [email]);
    if(existUser.length !== 1) throw new Error("why!?");
    const is_email_confirmed: boolean = existUser[0].is_email_confirmed;
    if(!is_email_confirmed){
      // メールが確認状態ならば既存のカラムは無視し、パスワードを書き換える
      await client.execute(`UPDATE users
        SET client_random_value = ?,
        encrypted_master_key = ?,
        hashed_authentication_key = ?
        WHERE email = ?`, [client_random_value, encrypted_master_key, hashed_authentication_key, email]);
      // これまでの確認メールに付属していたリンクは削除する
      await deleteEmailConfirm(email);
    }
  }
  
  const newuser=new User(email, client_random_value, encrypted_master_key, hashed_authentication_key);
  return newuser;
}

export const userEmailConfirm = async(email: string, email_confirmation_token: string) =>{
  try {
    const confirmed = await isEmailConfirmSuccess(email, email_confirmation_token);
    if(confirmed){
      await client.execute(`UPDATE users SET is_email_confirmed = ? WHERE email = ?`, [true, email]);
    }
    return confirmed;  
  } catch (e){
    console.log(e);
    return false;
  }
}



