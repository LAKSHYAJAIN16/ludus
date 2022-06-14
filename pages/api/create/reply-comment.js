import { Ref, Collection, Create } from "faunadb";
import { randomBytes } from "crypto";

import { client } from "../../../lib/fauna";

export default async function handler(req, res) {
  const fauna = client;

  //Compile Payload
  const payload = {
    user: Ref(Collection("users"), req.body.userID),
    post : Ref(Collection("posts"), req.body.postID),
    text: req.body.text,
    toc: new Date(Date.now()).toISOString(),
    userInfo: req.body.userInfo,
    id : randomBytes(16).toString("hex"),
    thread : req.body.thread,
  };

  //FQL
  try {
    const docs = await fauna.query(
      Create(Collection("comments"), { data: payload })
    );
    res.status(200).send(docs);
  } catch (err) {
    res.json(err);
  }
}
