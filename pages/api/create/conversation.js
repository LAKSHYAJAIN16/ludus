import { Ref, Collection, Create } from "faunadb";
import { randomBytes } from "crypto";

import { client } from "../../../lib/fauna";

export default async function handler(req, res) {
  const fauna = client;

  //Compile Payload
  const payload = {
    id: randomBytes(16).toString("hex"),
    user1: Ref(Collection("users"), req.body.user1ID),
    user2: Ref(Collection("users"), req.body.user2ID),
    toc: new Date(Date.now()).toISOString(),
    userInfo: {
      u1: req.body.user1Info,
      u2: req.body.user2Info,
    },
  };

  //FQL
  try {
    const docs = await fauna.query(
      Create(Collection("conversations"), { data: payload })
    );
    res.status(200).send(docs);
  } catch (err) {
    res.json(err);
  }
}
