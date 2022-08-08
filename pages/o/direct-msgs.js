import React, { useState } from "react";
import Image from "next/image";

import Navbar from "../../components/Navbar";

export default function DirectMessages() {
  const [displayAddModal, setDisplayAddModal] = useState(false);

  const AddModal = () => (
    <>
      <div className="blocker" />
      <div className="main">
        {/* X + Head */}
        <div className="flex">
          <span className="x" onClick={() => setDisplayAddModal(false)}>
            X
          </span>

          <span className="startConversation">Start a Conversation</span>
        </div>

        {/* Search Box */}
        <div className="flex">
            
        </div>
      </div>
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
            width: 500px;
            height: 500px;
            background-color: white;
            z-index: 100;
            border-radius: 25px;
            left: 50%;
            top: 48%;
            -webkit-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
            padding-left: 20px;
            padding-top: 20px;
          }

          .flex {
            display : flex;
            align-items : center;
          }

          .x {
            font-weight: 900;
            font-size: 1.2em;
            cursor: pointer;
          }

          .startConversation {
            font-weight: 900;
            font-size : 1.2em;
            margin-left: 30px;
          }
        `}
      </style>
    </>
  );

  return (
    <>
      <div>
        <Navbar />
        <div className="display side-content2 content">
          <div className="left">
            <div className="top">
              <span className="heading">Direct Messages</span>
              <img src="/settings_MSGS.png" className="gear" />
              <img
                src="/plus_MSGS.png"
                className="plus"
                onClick={() => setDisplayAddModal(true)}
              />
            </div>
          </div>
        </div>

        {displayAddModal && (
          <>
            <AddModal />
          </>
        )}
      </div>
      <style jsx>
        {`
          .side-content2 {
            margin-left: 260px;
          }

          .content {
            margin-top: 0px;
            position: absolute;
            width: 350px;
            height: 95%;
            border-left: 1px solid lightgrey;
            border-right: 1px solid lightgrey;
            padding-left: 20px;
            padding-right: 20px;
            padding-top: 10px;
          }

          .top {
            display: flex;
            align-items: center;
          }

          .heading {
            margin-top: 0px;
            font-size: 1.3em;
            font-weight: 700;
          }

          .gear {
            width: 18px;
            height: 18px;
            margin-left: 130px;
            cursor: pointer;
          }

          .plus {
            width: 15px;
            height: 15px;
            margin-left: 10px;
            cursor: pointer;
          }
        `}
      </style>
    </>
  );
}
