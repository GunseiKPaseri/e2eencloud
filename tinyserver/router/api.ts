import { Router } from "https://deno.land/x/opine@2.0.2/mod.ts";
import { addEmailConfirmation } from "../model/EmailConfirmations.ts";
import { addUser, userEmailConfirm } from '../model/Users.ts';

const router = Router();

const byteArray2base64 = (x: Uint8Array) => btoa(String.fromCharCode(...x));

router.post("/signup", async (req, res) => {
    const email: unknown = req.body.email;
    const client_random_value: unknown = req.body.client_random_value;
    const encrypted_master_key: unknown = req.body.encrypted_master_key;
    const hashed_authentication_key: unknown = req.body.hashed_authentication_key;
    if (typeof email !== 'string' ||
        typeof client_random_value !== 'string' ||
        typeof encrypted_master_key !== 'string' ||
        typeof hashed_authentication_key !== 'string'){
          res.send({success: false});
          return;
        }
    try{
      const user = await addUser(email, client_random_value, encrypted_master_key, hashed_authentication_key);
      console.log(user);
      // 128 bit email confirmation token
      const email_confirmation_token = crypto.getRandomValues(new Uint8Array(16));
      const token = byteArray2base64(email_confirmation_token);
      await addEmailConfirmation(email, token);
      console.log("SEND<", email, "> ", token);
      res.send({success: true});
    }catch (e){
      // userがそのメールアドレスが登録済か知る必要はない
      console.log(e);
      return res.send({success: true});
    }
  });

router.post("/email_confirm", async (req, res) => {
  const email: unknown = req.body.email;
  const email_confirmation_token: unknown = req.body.email_confirmation_token;
  if (typeof email !== 'string' ||
      typeof email_confirmation_token !== 'string'){
        return res.send({success: false});
      }
  const status = await userEmailConfirm(email, email_confirmation_token);
  res.send({success: status});
}); 

export default router;