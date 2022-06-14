import { Ref, Collection, Create } from "faunadb";
import { randomBytes } from "crypto";

import { client } from "../../../lib/fauna";

export default async function handler(req, res) {
  const fauna = client;

  //Compile Payload
  const payload = {
    user: Ref(Collection("users"), req.body.userID),
    id : randomBytes(10).toString("hex"),
    ...req.body
  };

  //FQL
  try {
    const docs = await fauna.query(
      Create(Collection("messages"), { data: payload })
    );
    res.status(200).send(docs);
  } catch (err) {
    res.json(err);
  }
}
