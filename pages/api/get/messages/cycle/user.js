import { client } from "../../../../../lib/fauna";

import {
  Map,
  Paginate,
  Lambda,
  Get,
  Match,
  Index,
  Ref,
  Collection,
} from "faunadb";

export default async function handler(req, res) {
  //Init Fauna
  const fauna = client;

  //Get Params
  const userID = req.query.id;
  const bID = req.query.bID;
  const size = parseInt(req.query.size)
  
  //FQL
  try {
    const docs = await fauna.query(
      Map(
        Paginate(
          Match(Index("messages_byUser"), Ref(Collection("users"), userID)),
          {
            size: size,
            before: Ref(Collection("messages"), bID),
          }
        ),
        Lambda((x) => Get(x))
      )
    );
    res.status(200).send(docs);
  } catch (err) {
    res.json(err);
  }
}
