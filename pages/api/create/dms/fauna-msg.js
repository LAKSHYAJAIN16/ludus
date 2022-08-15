import { Create, Collection } from "faunadb";
import { randomBytes } from "crypto";

import { client } from "../../../../lib/fauna";

export default async function handler(req, res) {
  //Init
  const fauna = client;

  //Assemble Payload
  const payload = {
    toc: new Date(Date.now()).toISOString(),
    id: randomBytes(16).toString("hex"),
    ...req.body,
  };

  //Fauna
  try {
    const doc = await fauna.query(Create(Collection("dms"), { data: payload }));
    res.status(200).json(doc);
  } catch (err) {
    res.send(err);
  }
}
