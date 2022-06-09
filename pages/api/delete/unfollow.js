import { client } from "../../../lib/fauna";

import { Delete, Collection, Ref, Match, Index, Select, Get } from "faunadb";

export default async function handler(req, res) {
  const fauna = client;

  //Intercept params
  const target = req.query.target;
  const targetee = req.query.targetee;

  //Delete
  try {
    const docs = await fauna.query(
      Delete(
        Select(
          "ref",
          Get(
            Match(
              Index("followers_retrieval"),
              Ref(Collection("users"), target),
              Ref(Collection("users"), targetee)
            )
          )
        )
      )
    );
    res.send(docs);
  } catch (err) {
    res.json(err);
  }
}
