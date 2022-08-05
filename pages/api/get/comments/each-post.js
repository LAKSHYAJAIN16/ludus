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
  //Init Fauna
  const fauna = client;

  //Get Data
  const postID = req.query.id;

  //Query
  try {
    const docs = await fauna.query(
      Map(
        Paginate(
          Match(Index("comment_byPost"), Ref(Collection("posts"), postID))
        ),
        Lambda((x) => Get(x))
      )
    );
    const len = docs.data.length;
    console.log(len);

    //Create a return Docs array, which will add the "replies parameter"
    const returnDocs = [];
    for (let k = 0; k < len; k++) {
      const element = docs.data[k];
      if(element.data.thread === ""){
        const newThing = {
          ...element,
          replies : []  
        }
        returnDocs.push(newThing);
      }
    }

    //Loop through each document again
    for (let i = 0; i < len; i++) {
      const mainDoc = docs.data[i];
      
      //Check if it is an init or a reply
      if(mainDoc.data.thread !== ""){
        //Get the doc we're looking for
        const thready = mainDoc.data.thread;

        //Loop through to find the doc
        for (let j = 0; j < returnDocs.length; j++) {
          if(returnDocs[j].data.id === thready){
            returnDocs[j].replies.push(mainDoc);
            break;
          }
        }
      }
    }

    res.status(200).send(returnDocs);
  } catch (err) {
    res.json(err);
  }
}
