import { client } from "../../../../lib/fauna";

import {
  Map,
  Paginate,
  Match,
  Index,
  Lambda,
  Get,
  Ref,
  Collection,
} from "faunadb";

export default async function handler(req, res) {
  //Init Fauna
  const fauna = client;

  //Get Params
  const postID = req.query.id;
  console.log(postID);

  //Match with Index
  try {
    const docs = await fauna.query(
      Map(
        Paginate(
          Match(Index("reactions_on_post"), Ref(Collection("posts"), postID))
        ),
        Lambda((x) => Get(x))
      )
    );
    res.status(200).send(docs);
  } catch (err) {
    res.json(err);
  }
}
