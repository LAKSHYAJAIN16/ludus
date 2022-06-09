import { client } from "../../../lib/fauna";

import { Collection, Create, Ref } from "faunadb";

export default async function handler(req, res) {
  const fauna = client;

  //Intercept Payload
  const payload = req.body;
  const finalPayload = {
    target: Ref(Collection("users"), payload.target),
    targetee: Ref(Collection("users"), payload.targetee),
    toc: payload.toc,
    targeteeInfo: payload.targeteeInfo,
  };

  //Send FQL
  try {
    const docs = await fauna.query(
      Create(Collection("follower_edge"), { data: finalPayload })
    );
    res.status(200).send(docs);
  } catch (err) {
    res.json(err);
  }
}
