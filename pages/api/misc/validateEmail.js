import SCHOOLS from "../../../lib/schoolToDomain";
import SERVERS from "../../../lib/schoolToServer";

export default async function handler(req, res) {
  //Get our email
  const email = req.body.email;

  //Check if our email is in the registry
  const keys = Object.keys(SCHOOLS);
  const values = Object.values(SCHOOLS);

  for (let i = 0; i < values.length; i++) {
    const domain = values[i];

    //Sub Regex query to see if the domain matches
    const idx = email.lastIndexOf("@");
    if (idx > -1 && email.slice(idx + 1) === domain) {
      res.status(200).json({
          isValid : true,
          domain : domain,
          serverName : keys[i],
          serverID : SERVERS[keys[i]]
      })

      break;
    }
  }

  res.status(200).json({
      isValid : false,
      msg : "lol bro u not allowed"
  })
}
