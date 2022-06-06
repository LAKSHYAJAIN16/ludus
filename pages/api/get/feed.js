import { Map, Paginate, Documents, Collection, Lambda, Get } from "faunadb";

import { client } from "../../../lib/fauna";

export default async function handler(req, res) {
  //Init Fauna
  const fauna = client;

  //Get User Ref
  const userRef = req.query.uID;

  //Just Return All Posts for now
  try {
    const docs = await fauna.query(
      Map(
        Paginate(Documents(Collection("posts"))),
        Lambda((x) => Get(x))
      )
    );
    res.status(200).json(docs);
  } catch (err) {
    res.json(err);
  }
}
