import React from "react";

import axios from "axios";

export default function Landing() {
  const validateEmail = async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);
    const formData = Object.fromEntries(form.entries());
    const email = formData.email;

    //Call API
    const res = await axios.post("/api/misc/validateEmail", { email: email });
    const data = res.data;

    if(data.isValid === true){
      window.location.replace(`/signup?e=${email}&sName=${data.serverName}&sI=${data.serverID}&domain=${data.domain}`)
    }

    if(data.isValid === false){
      alert("yall not authed bruh");
    }
  };

  return (
    <>
      <div className="main flex-col" style={{ justifyContent: "normal" }}>
        <h1 className="heading">Introducing Ludus</h1>
        <p className="subHead">
          The Benifits of Social Media with full security
        </p>

        <p className="introToInput">
          To Create an account, enter your school email
        </p>
        <form onSubmit={validateEmail}>
          <input
            className="input"
            name="email"
            placeholder="Your Email"
            type="email"
            required
          />
          <br />
          <button className="continue">Continue</button>
        </form>
      </div>
      <style jsx>
        {`
          .heading {
            font-weight: 500;
            text-align: center;
            margin-top: 20px;
            font-size: 3em;
          }

          .subHead {
            margin-top: -20px;
            font-size: 1.2em;
          }

          .introToInput {
            margin-top: 50px;
            font-size: 1.2em;
          }

          .input {
            width: 300px;
            border: 2px solid black;
            border-radius: 25px;
          }
        `}
      </style>
    </>
  );
}
