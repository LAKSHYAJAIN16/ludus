import { Collection, Create, Ref } from "faunadb";
import { randomBytes } from "crypto";

import { client } from "../../../lib/fauna";

export default async function handler(req, res) {
  //Init Client
  const fauna = client;

  //Get Data
  const data = req.body;

  //Compile final Fauna OBJ
  const payload = {
    postRef : Ref(Collection("posts"), data.post),
    userRef : Ref(Collection("users"), data.user),
    emotion: data.emotion,
    toc: data.toc,
    userInfo: data.userInfo,
    id: randomBytes(16).toString("hex"),
  };
  console.log(payload);

  //Create
  try {
    const doc = await fauna.query(
      Create(Collection("reactions"), { data: payload })
    );
    res.status(200).send(doc);
  } catch (err) {
    res.json(err);
  }
}
