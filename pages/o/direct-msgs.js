import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

import sleep from "../../lib/sleep";
import Navbar from "../../components/Navbar";

export default function DirectMessages() {
  //All of the search Users
  const [searchUsers, setSearchUsers] = useState([]);

  //All of our active conversations
  const [activeConvos, setActiveConvos] = useState([]);

  //Our User
  const [ourUser, setOurUser] = useState();
  const [ourRef, setOurRef] = useState();

  //UI vars
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [displayAddModal, setDisplayAddModal] = useState(false);
  const [displayLoadingModal, setDisplayLoadingModal] = useState(false);

  useEffect(() => {
    const run = async () => {
      //Set Users
      const temp_user = JSON.parse(localStorage.getItem("u_u"));
      const temp_ref = JSON.parse(localStorage.getItem("u_ref"))["@ref"].id;
      setOurUser(temp_user);
      setOurRef(temp_ref);

      //Get All of the active conversations
      setLoadingConvos(true);
      const res1 = await axios.get(
        `/api/get/conversations/active-conversations?id=${temp_ref}`
      );
      const t_activeConvos = res1.data.data;
      setActiveConvos(t_activeConvos);
      setLoadingConvos(false);
    };
    run();
  }, []);

  async function renderChange(text) {
    //Call our full text search API
    const docs = await axios.get(`/api/get/dms/full-text-search?s=${text}`, {});
    const users = docs.data.data;
    console.log(users);
    setSearchUsers(users);

    await sleep(0.1);

    //Do weird stuff becuz javascript :L (again)
    const inputElement = document.getElementById("searchInputThingy");
    inputElement.value = text;
    inputElement.focus();
  }

  async function startConversation(e) {
    //Close AddModal Banner and open Loading Modal
    setDisplayAddModal(false);
    setDisplayLoadingModal(true);

    //Instantiate Payload (set us as user1)
    const payload = {
      user1ID: ourRef,
      user2ID: e[1]["@ref"].id,
      user1Info: {
        username: ourUser.username,
        server: ourUser.serverName,
        pfpic: ourUser.pfpic,
        grade: ourUser.grade,
        section: ourUser.section,
      },
      user2Info: {
        username: e[0],
        server: e[3],
        pfpic: e[4],
        grade: e[5],
        section: e[6],
      },
    };

    //API
    const res = await axios.post("/api/create/conversation", payload);
    console.log(res);
    setDisplayLoadingModal(false);
  }

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

        <div className="flex searchBox">
          <Image src="/search_MSGS.png" width={15} height={15} />
          <input
            className="searchInput"
            placeholder="Search for a User"
            onChange={(e) => renderChange(e.target.value)}
            id="searchInputThingy"
          />
        </div>

        <div>
          <div className="allSearchUsers">
            <>
              {searchUsers.map((e, idx) => (
                <div
                  className="flex searchUser"
                  key={idx}
                  onClick={() => startConversation(e)}
                >
                  <img src={e[4]} className="searchUserPFPIC" />
                  <p className="searchUserName">{e[0]}</p>
                  <p className="searchUserDetails">
                    {e[3]} | {e[5]} | {e[6]}
                  </p>
                </div>
              ))}
            </>
          </div>
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
            display: flex;
            align-items: center;
          }

          .x {
            font-weight: 900;
            font-size: 1.2em;
            cursor: pointer;
          }

          .startConversation {
            font-weight: 900;
            font-size: 1.2em;
            margin-left: 30px;
          }

          .searchBox {
            padding-top: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid lightgrey;
          }

          .searchInput {
            border: none;
            outline: none;
            font-family: var(--mainfont);
            padding-left: 10px;
            width: 450px;
          }

          .searchUser {
            cursor: pointer;
            margin-top: 10px;
          }

          .searchUserPFPIC {
            width: 40px;
            height: 40px;
            border-radius: 50%;
          }

          .searchUserName {
            padding-left: 10px;
            font-size: 1em;
            font-weight: 600;
          }

          .searchUserDetails {
            position: absolute;
            margin-left: 400px;
            font-size: 0.8em;
          }
        `}
      </style>
    </>
  );

  const LoadingModal = () => (
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

  return (
    <>
      <div>
        <Navbar />
        <div className="display side-content2 content">
          <div className="left">
            {/* Top things */}
            <div className="top">
              <span className="heading">Direct Messages</span>
              <img src="/settings_MSGS.png" className="gear" />
              <img
                src="/plus_MSGS.png"
                className="plus"
                onClick={() => setDisplayAddModal(true)}
              />
            </div>
            <br />

            {/* Active Conversations */}
            <div className="activeConversations">
              {loadingConvos ? (
                <div className="loader activeLoader" />
              ) : (
                <>
                  {activeConvos.map((e) => (
                    <div className="flex convo">
                      <img
                        src={
                          e.data.user1["@ref"].id === ourRef
                            ? e.data.userInfo.u2.pfpic
                            : e.data.userInfo.u1.pfpic
                        }
                        className="convoPfpic"
                      />

                      <p className="convoName">
                        {e.data.user1["@ref"].id === ourRef
                          ? e.data.userInfo.u2.username
                          : e.data.userInfo.u1.username}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {displayAddModal && <AddModal />}
        {displayLoadingModal && <LoadingModal />}
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

          .activeLoader {
            width: 70px;
            height: 70px;
            margin-left: auto;
            margin-right: auto;
            margin-top: 150px;
          }

          .activeConversations {
            height: 100%;
            overflow: none;
          }

          .flex {
            display: flex;
            align-items: center;
          }

          .convo {
            margin-top: 10px;
            cursor : pointer;
          }

          .convoPfpic {
            width: 45px;
            height: 45px;
            border-radius: 50%;
          }

          .convoName {
            margin-left : 10px;
            font-weight : 500;
            font-family : var(--mainfont);
          }
        `}
      </style>
    </>
  );
}
