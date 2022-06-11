import { client } from "../../../../lib/fauna";

import {
  Map,
  Paginate,
  Lambda,
  Index,
  Ref,
  Collection,
  Get,
  Match,
} from "faunadb";

export default async function handler(req, res) {
  const fauna = client;

  //Compile data
  const postID = req.query.postID;
  const userID = req.query.userID;

  //Compound FQLs (holy smokes)
  try {
    const followers = await fauna.query(
      Map(
        Paginate(
          Match(
            Index("followers_targeteeRetrieval"),
            Ref(Collection("users"), userID)
          )
        ),
        Lambda((x) => Get(x))
      )
    );

    const docs = await fauna.query(
      Map(
        Paginate(
          Match(Index("comment_byPost"), Ref(Collection("posts"), postID))
        ),
        Lambda((x) => Get(x))
      )
    );

    //Get all of our followees who have commented on the post
    const actualFollowers = followers.data;
    const actualDocs = docs.data;

    //Loop
    const actuals = [];
    const finFollowers = [];
    const finElements = [];

    for (let i = 0; i < actualDocs.length; i++) {
      const element = actualDocs[i];
      for (let j = 0; j < actualFollowers.length; j++) {
        const follower = actualFollowers[j];

        //Yay BUGS!
        const followerID = follower.data.target;
        const keys = Object.keys(followerID);
        const finFollower = followerID[keys[0]].id;
        finFollowers.push(finFollower);

        const elementID = element.data.user;
        const elementKeys = Object.keys(followerID);
        const finElementID = elementID[elementKeys[0]].id;
        finElements.push(finElementID);

        if (finFollower === finElementID) {
          actuals.push(element);
          break;
        }

        if (finElementID === userID) {
          actuals.push(element);
          break;
        }
      }
    }

    res
      .status(200)
      .send({
        actuals,
        finElements,
        finFollowers,
        actualFollowers,
        actualDocs,
      });
  } catch (err) {
    res.json(err);
  }
}
