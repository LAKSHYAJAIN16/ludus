import {
  Paginate,
  Index,
  Match,
  Get,
  Intersection,
} from "faunadb";

import { client } from "../../../../lib/fauna";

export default async function handler(req, res) {
  //Init Fauna
  const fauna = client;

  //Get Server and name
  const server = req.query.server;
  const name = req.query.name;

  //FQL
  try {
    const docs = await fauna.query(
      Get(
        Intersection(
          Match(Index("user_byServer"), server),
          Match(Index("user_byName"), name)
        )
      )
    );
    res.status(200).send({ found: true, ...docs });
  } catch (err) {
    if (err.name === "NotFound") {
      res.json({ found: false });
    }
    else {
        res.json(err);
    }
  }
}
