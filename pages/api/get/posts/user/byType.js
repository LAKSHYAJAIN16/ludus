import {
  Collection,
  Get,
  Index,
  Intersection,
  Lambda,
  Map,
  Match,
  Paginate,
  Ref,
} from "faunadb";
import { client } from "../../../../../lib/fauna";

export default async function handler(req, res) {
  //Init Fauna
  const fauna = client;

  //Get Params
  const userID = req.query.userID;
  const type = req.query.type;

  //FQL
  try {
    const docs = await fauna.query(
      Map(
        Paginate(
          Intersection(
            Match(Index("post_byUser"), Ref(Collection("users"), userID)),
            Match(Index("post_byType"), type)
          )
        ),
        Lambda((x) => Get(x))
      )
    );
    res.status(200).send(docs);
  } catch (err) {
    res.json(err);
  }
}
