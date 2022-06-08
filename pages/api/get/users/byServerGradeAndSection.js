import {
    Paginate,
    Index,
    Match,
    Map,
    Lambda,
    Intersection,
    Get,
  } from "faunadb";
  
  import { client } from "../../../../lib/fauna";
  
  export default async function handler(req, res) {
    //Init Fauna
    const fauna = client;
  
    //Get Server and grade and section
    const server = req.query.server;
    const grade = req.query.grade;
    const section = req.query.section;
  
    //FQL
    try {
      const docs = await fauna.query(
        Map(
          Paginate(
            Intersection(
              Match(Index("user_byServer"), server),
              Match(Index("user_byGrade"), grade),
              Match(Index("user_bySection"), section),
            )
          ),
          Lambda((x) => Get(x))
        )
      );
      res.status(200).send({ found: true, ...docs });
    } catch (err) {
      if (err.name === "NotFound") {
        res.json({ found: false });
      } else {
        res.json(err);
      }
    }
  }
  