import { Collection, Get, Ref } from "faunadb";
import { client } from "../../../../lib/fauna";

export default async function handler(req, res) {
  //Init Client
  const fauna = client;

  //Get id
  const id = req.query.id;

  //FQL
  try {
    const doc = await fauna.query(Get(Ref(Collection("posts"), id)));
    res.status(200).send(doc);
  } catch (err) {
    res.json(err);
  }
}
