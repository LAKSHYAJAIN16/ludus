import { Create, Collection, Ref } from "faunadb";
import { randomBytes } from "crypto";

import { client } from "../../../lib/fauna";

export default async function handler(req, res) {
  //Init Fauna
  const fauna = client;

  //Get ze data
  const data = {
    ...req.body,
    id : randomBytes(16).toString("hex"),
    user : Ref(Collection("users"), req.body.userID)
  }

  //Define Query using FQL
  try {
    const doc = await fauna.query(Create(Collection("posts"), { data }));
    res.status(200).send(doc);
  } catch (error) {
    res.json(error);
  }
}
