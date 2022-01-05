import client from '../dbclient.ts';

export class User{
  readonly email: string;
  readonly client_random_value: string;
  readonly encrypted_master_key: string;
  readonly hashed_authentication_key: string;
  constructor(email: string, client_random_value: string, encrypted_master_key: string, hashed_authentication_key: string) {
    this.email = email;
    this.client_random_value = client_random_value;
    this.encrypted_master_key = encrypted_master_key;
    this.hashed_authentication_key = hashed_authentication_key;
  }
}

export const addUser = async (email: string, client_random_value: string, encrypted_master_key: string, hashed_authentication_key: string) => {
  await client.execute(`INSERT INTO users(
    id,
    client_random_value,
    encrypted_master_key,
    hashed_authentication_key) values(?, ?, ?, ?)`,
    [email, client_random_value, encrypted_master_key, hashed_authentication_key]);

  const newuser=new User(email, client_random_value, encrypted_master_key, hashed_authentication_key);
  return newuser;
}



