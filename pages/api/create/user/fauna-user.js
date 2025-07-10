import { Create, Collection } from "faunadb";
import { scryptSync, randomBytes } from "crypto";

import { client } from "../../../../lib/fauna";

export default async function handler(req, res) {
  //Get Client
  const fauna = client;

  //Get the Data
  const inData = req.body;

  //Hash Password using crypto module
  const salt = randomBytes(16).toString("hex");
  const hashedPassword = scryptSync(inData.dets.password, salt, 64).toString(
    "hex"
  );
  const newPassword = `${salt}:${hashedPassword}`;

  //Gen ID
  const id = randomBytes(10).toString("hex");

  //Define Data
  const data = {
    id: id,
    email: inData.server.email,
    phone: inData.dets.phone_number,
    username: inData.dets.name,
    grade: inData.dets.grade,
    section: inData.dets.section,
    password: newPassword,
    serverName: inData.server.serverName,
    sID: inData.server.sId,
    domain: inData.server.domain,
    toc: new Date(Date.now()).toISOString(),
    pfpic: `https://avatars.dicebear.com/api/pixel-art-neutral/${id}.svg`,
    customization: {
      banner:
        "https://www.solidbackgrounds.com/images/2560x1600/2560x1600-dark-gray-solid-color-background.jpg",
      colorScheme: "def",
      favColor: "",
      favSong: "",
      favMovie: "",
      bio: "A Proud ludus User!",
    },
  };
  console.log(data);

  //Define Query using FQL
  try {
    const doc = await fauna.query(Create(Collection("users"), { data }));
    res.status(200).send(doc);
    //Create Firebase
  } catch (error) {
    res.json(error);
  }
}
