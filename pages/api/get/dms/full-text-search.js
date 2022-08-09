import { client } from "../../../../lib/fauna";

import {
  Filter,
  Paginate,
  Match,
  Index,
  Lambda,
  ContainsStr,
  LowerCase,
  Var,
} from "faunadb";

export default async function handler(req, res) {
  //Fauna
  const fauna = client;

  //Get Search String
  const searchString = req.query.s;
  const new_searchString = searchString.toLowerCase();

  //Query
  try {
    const docs = await fauna.query(
      Filter(
        Paginate(Match(Index("user_search_full"))),
        Lambda(
          ["username", "ref", "bio", "server", "pfpic", "grade", "section"],
          ContainsStr(LowerCase(Var("username")), new_searchString)
        )
      )
    );
    res.status(200).json(docs);
  } catch (err) {
    res.send(err);
  }
}
