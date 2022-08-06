import React from "react";

import Navbar from "../../components/Navbar";

export default function Settings() {
  return (
    <>
      <div className="main">
        <Navbar />

        <div className="display side-content content">
          <p className="heading">Settings</p>
        </div>
      </div>

      <style jsx>
        {`
          .content {
            margin-top: 35px;
            position: absolute;
          }

          .heading {
            margin-top: 0px;
            font-weight: 500;
            font-size: 1.4em;
          }
        `}
      </style>
    </>
  );
}
