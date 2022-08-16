import { client } from "../../../../lib/fauna";

import {Map, Paginate, Union, Intersection, Match, Index, Lambda, Get} from "faunadb";

export default async function handler(req, res) {
  //Fauna
  const fauna = client;

  //Get Payload
  const u1 = req.query.u1;
  const u2 = req.query.u2;

  //Query
  try {
    const docs = await fauna.query(
      Map(
        Paginate(
          Union(
            Intersection(
              Match(Index("dm_bySender"), u1),
              Match(Index("dm_byReciever"), u2)
            ),
            Intersection(
              Match(Index("dm_bySender"), u2),
              Match(Index("dm_byReciever"), u1)
            )
          )
        ),
        Lambda(x => Get(x))
      )
    );
    res.status(200).json(docs);
  } catch (err) {
    res.send(err);
  }
}
