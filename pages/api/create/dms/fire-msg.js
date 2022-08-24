import { doc, setDoc } from "firebase/firestore";
import {randomBytes} from "crypto";

import db from "../../../../lib/firebase";

export default async function handler(req, res) {
  //Get Data
  const id = randomBytes(10).toString("hex");
  const data = {
    id : id,
    msg: {
      ...req.body.msg,
    },
    channel : req.query.channel,
    sender: req.body.sender,
    reciever: req.body.reciever,
  };

  await setDoc(doc(db, "msgs", id), data);

  res.status(200).json(data);
}
