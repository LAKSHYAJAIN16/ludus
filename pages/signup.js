import axios from "axios";
import React, { useEffect, useState } from "react";

export default function Signup() {
  const [params, setParams] = useState();

  useEffect(() => {
    const pars = new URL(window.location.href).searchParams;
    const dataForParams = {
      domain: pars.get("domain"),
      email: pars.get("e"),
      serverName: pars.get("sName"),
      sId: pars.get("sI"),
    };
    setParams(dataForParams);
  }, []);

  const submit = async(e) => {
    //Prevent Reload
    e.preventDefault();

    //Retrieve Data
    const form = new FormData(e.target);
    const formData = Object.fromEntries(form.entries());

    //Merge it with our Data
    const merged = {
      dets : formData,
      server : params
    }

    //Send Request
    const res= await axios.post("/api/create/user", merged);

    //Save the data to local storage
    localStorage.setItem("u_u", JSON.stringify(res.data.data));
    localStorage.setItem("u_ref", JSON.stringify(res.data.ref));

    window.location.replace("/o/home");
  };

  return (
    <>
      <div className="main flex-col" style={{ justifyContent: "normal" }}>
        <h1 className="h1">Signup</h1>
        <form onSubmit={submit}>
          <p>Username</p>
          <input name="name"></input>

          <p>Phone No </p>
          <input name="phone_number"></input>

          <p>Grade</p>
          <input type="number" name="grade"></input>

          <p>Section</p>
          <input name="section"></input>

          <p>Password</p>
          <input type="password" name="password"></input>

          <br />
          <br />
          <button>Submit</button>
        </form>
      </div>
      <style jsx>
        {`
          .h1 {
            text-align: center;
          }
        `}
      </style>
    </>
  );
}
