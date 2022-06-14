import { client } from "../../../../lib/fauna";

import { Map, Paginate, Lambda, Get, Match, Index } from "faunadb";

export default async function handler(req, res) {
  //Init Fauna
  const fauna = client;

  //Get Params
  const server = req.query.server;

  //FQL
  try {
    const docs = await fauna.query(
      Map(
        Paginate(Match(Index("messages_byServer"), server)),
        Lambda((x) => Get(x))
      )
    );
    res.status(200).send(docs);
  } catch (err) {
    res.json(err);
  }
}
