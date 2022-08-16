import React from "react";

export default function LoadingModal() {
  return (
    <>
      <div className="blocker" />
      <div className="main loader"></div>

      <style jsx>
        {`
          .blocker {
            position: fixed;
            min-width: 100%;
            min-height: 100%;
            background-color: rgba(0, 0, 0, 0.3);
            z-index: 0.1;
          }

          .main {
            position: fixed;
            z-index: 100;
            left: 45%;
            top: 40%;
            width: 100px;
            height: 100px;
            -webkit-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
          }
        `}
      </style>
    </>
  );
}
