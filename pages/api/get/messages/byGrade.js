import { client } from "../../../../lib/fauna";

import {
  Map,
  Paginate,
  Lambda,
  Get,
  Intersection,
  Match,
  Index,
} from "faunadb";

export default async function handler(req, res) {
  //Init Fauna
  const fauna = client;

  //Get Params
  const server = req.query.server;
  const grade = req.query.grade;

  //FQL
  try {
    const docs = await fauna.query(
      Map(
        Paginate(
          Intersection(
            Match(Index("messages_byServer"), server),
            Match(Index("messages_byGrade"), grade)
          )
        ),
        Lambda(x => Get(x))
      )
    );
    res.status(200).send(docs);
  } catch (err) {
    res.json(err);
  }
}
