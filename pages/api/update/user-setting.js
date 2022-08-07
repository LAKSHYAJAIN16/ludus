import { client } from "../../../lib/fauna";

import {Update, Ref, Collection} from "faunadb";

export default async function handler(req, res){
    //Fauna
    const fauna = client;

    //Get the payload
    const field = req.query.f;
    const value = req.query.v;
    const userID = req.query.u;

    //Assemble data
    const data = {};
    data[field] = value;

    //Query
    try{
        const doc = await fauna.query(
            Update(
                Ref(Collection("users"), userID),
                {data : data}
            )
        )
        res.status(200).send(doc);
    }
    catch(err){
        res.json(err);
    }
}