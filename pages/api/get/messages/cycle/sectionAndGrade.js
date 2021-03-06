import { client } from "../../../../../lib/fauna";

import {
  Map,
  Paginate,
  Lambda,
  Get,
  Intersection,
  Match,
  Index,
  Ref,
  Collection,
} from "faunadb";

export default async function handler(req, res) {
  //Init Fauna
  const fauna = client;

  //Get Params
  const server = req.query.server;
  const grade = req.query.grade;
  const section = req.query.section;
  const beforeID = req.query.bID;
  const size = parseInt(req.query.size);

  //FQL
  try {
    const docs = await fauna.query(
      Map(
        Paginate(
          Intersection(
            Match(Index("messages_byServer"), server),
            Match(Index("messages_byGrade"), grade),
            Match(Index("messages_bySection"), section),
            Match(Index("message_byChatState"), 1),
          ),
          { size: size, before: Ref(Collection("messages"), beforeID) }
        ),
        Lambda((x) => Get(x))
      )
    );
    res.status(200).send(docs);
  } catch (err) {
    res.json(err);
  }
}
