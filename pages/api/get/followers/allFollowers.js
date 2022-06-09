import { Collection, Get, Index, Lambda, Map, Match, Paginate, Ref } from "faunadb";
import { client } from "../../../../lib/fauna";

export default async function handler(req, res) {
  const fauna = client;

  //Get Target ID
  const targetID = req.query.id;

  //FQL
  try {
    const docs = await fauna.query(
      Map(
        Paginate(
          Match(
            Index("followers_allRetrieval"),
            Ref(Collection("users"), targetID)
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
