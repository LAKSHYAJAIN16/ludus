import { client } from "../../../../lib/fauna";

import {
  Map,
  Paginate,
  Union,
  Match,
  Index,
  Ref,
  Collection,
  Lambda,
  Get,
} from "faunadb";

export default async function handler(req, res) {
  //Fauna
  const fauna = client;

  //Get Payload
  const id = req.query.id;

  //Query
  try {
    const docs = await fauna.query(
      Map(
        Paginate(
          Union(
            Match(Index("conversations_user1"), Ref(Collection("users"), id)),
            Match(Index("conversations_user2"), Ref(Collection("users"), id))
          )
        ),
        Lambda((x) => Get(x))
      )
    );
    res.status(200).json(docs);
  } catch (err) {
    res.send(err);
  }
}
