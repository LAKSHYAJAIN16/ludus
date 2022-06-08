import axios from "axios";
import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";

export default function Profile() {
  const [user, setUser] = useState({});

  useEffect(() => {
    const run = async () => {
      //Get the Server and the User
      const allArgs = window.location.href.split("/");
      const server = allArgs[3];
      const name = allArgs[4];

      //Call API
      const res = await axios.get(
        `/api/get/users/byServerAndName?server=${server}&name=${name}`
      );
      console.log(res);
    };

    run();
  }, []);

  return (
    <>
      <div className="main">
        <Navbar />
      </div>
    </>
  );
}
