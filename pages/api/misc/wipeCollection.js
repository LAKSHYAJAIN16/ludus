import { client } from "../../../lib/fauna";

import {
  Map,
  Paginate,
  Documents,
  Collection,
  Lambda,
  Delete,
  Var,
} from "faunadb";

export default async function handler(req, res) {
  const fauna = client;
  const id = req.query.id;

  try {
    const docs = await fauna.query(
      Map(
        Paginate(Documents(Collection(id))),
        Lambda(["ref"], Delete(Var("ref")))
      )
    );
    res.status(200).send(docs);
  } catch (err) {
    res.json(err);
  }
}
