import { Paginate, Index, Match, Map, Lambda, Get } from "faunadb";

import { client } from "../../../../lib/fauna";

export default async function handler(req, res) {
  //Init Fauna
  const fauna = client;

  //Get Server
  const server = req.query.server;

  //FQL
  try {
    const docs = await fauna.query(
      Map(
        Paginate(Match(Index("user_byServer"), server)),
        Lambda(x => Get(x))
      )
    );
    res.status(200).send(docs);
  } catch (err) {
    res.json(err);
  }
}