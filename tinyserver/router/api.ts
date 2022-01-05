import { Router } from "https://deno.land/x/opine@2.0.2/mod.ts";
import { addUser } from '../model/Users.ts';

const router = Router();
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
      const newuser = await addUser(email, client_random_value, encrypted_master_key, hashed_authentication_key)
      console.log(newuser);
      res.send({success: true});
    }catch(e){
      console.log("failed", e);
      return res.send({success: false});
    }
  });

export default router;