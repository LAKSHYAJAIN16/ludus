import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { motion } from "framer-motion";
import { query, collection, where, onSnapshot } from "firebase/firestore";

import db from "../../lib/firebase";
import sleep from "../../lib/sleep";
import Navbar from "../../components/Navbar";
import Loader from "../../components/Loader";
import LoadingModal from "../../components/LoadingModal";

export default function DirectMessages() {
  //All of the search Users
  const [searchUsers, setSearchUsers] = useState([]);

  //All of our active conversations
  const [activeConvos, setActiveConvos] = useState([]);

  //Active Chat User
  const [activeChatUser, setActiveChatUser] = useState({
    otherGuy: { data: {} },
    ourGuy: { data: {} },
  });

  //Chat Message Info
  const [chatMessageInfo, setChatMessageInfo] = useState({});
  const [currentChatID, setCurrentChatID] = useState("");

  //Our User
  const [ourUser, setOurUser] = useState();
  const [ourRef, setOurRef] = useState();

  //UI vars
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [displayAddModal, setDisplayAddModal] = useState(false);
  const [displayLoadingModal, setDisplayLoadingModal] = useState(false);
  const [displayMessageLoading, setDisplayMessageLoading] = useState(false);

  //Dev :L
  const [called, setCalled] = useState(false);

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

      //Add a new snapshot listener
      const q = query(
        collection(db, "msgs"),
        where("reciever", "==", temp_ref)
      );

      //Simple Boolean to check for the first query since firebase always gives pre-existing data too lol
      let initialQuery = true;
      const snapyBoi = onSnapshot(q, (querySnapshot) => {
        if (initialQuery === true) {
          initialQuery = false;
        } else {
          //Get docChanges
          const docChanges = querySnapshot.docChanges();
          for (let index = 0; index < docChanges.length; index++) {
            const docChange = docChanges[index];

            if (docChange.type === "added") {
              //Get the actual Doc
              const docData = docChange.doc.data();
              console.log({ a: docChange.doc.id, b: docData });
            }
          }
        }
      });

      //Dev :L
      setCalled(true);
    };

    if (called === false) {
      run();
    }
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

  async function startChat(e) {
    //Do some setup for convinience
    let us = {};
    let otherGuy = {};
    if (e.data.user1["@ref"].id === ourRef) {
      us = { user: "u1", data: e.data.userInfo.u1, ref: e.data.user1 };
      otherGuy = { user: "u2", data: e.data.userInfo.u2, ref: e.data.user2 };
    } else {
      us = { user: "u2", data: e.data.userInfo.u2, ref: e.data.user2 };
      otherGuy = { user: "u1", data: e.data.userInfo.u1, ref: e.data.user1 };
    }
    e["ourGuy"] = us;
    e["otherGuy"] = otherGuy;
    setActiveChatUser(e);

    //Now actually get the messages lol
    getAllMessages(e.data.user1["@ref"].id, e.data.user2["@ref"].id);
  }

  async function msgText(key, txt) {
    if (key === "Enter") {
      //Create Payload
      const payload = {
        msg: {
          type: "text",
          text: txt,
        },
        sender: activeChatUser.ourGuy.ref["@ref"].id,
        reciever: activeChatUser.otherGuy.ref["@ref"].id,
      };
      console.log(payload);

      //API (fauna backend)
      const res = await axios.post("/api/create/dms/fauna-msg", payload);
      console.log(res);

      //Firebase realtime backend
      const res2 = await axios.post("/api/create/dms/fire-msg", payload);
      console.log(res2);
    }
  }

  async function getAllMessages(u1, u2) {
    //Get all of the Keys, or Chats we've already buffered
    const keys = Object.keys(chatMessageInfo);
    console.log(keys);

    //Generate both possible ID combinations (ikr)
    const idGen1 = u1 + u2;
    const idGen2 = u2 + u1;

    //Check if the keys array contains either of them
    let found = false;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key === idGen1 || key === idGen2) {
        console.log("already queried LUL!");
        found = true;
        setCurrentChatID(key);
        break;
      }
    }

    if (found === false) {
      //API
      setDisplayMessageLoading(true);
      const res = await axios.get(`/api/get/dms/msgs?u1=${u1}&u2=${u2}`);
      const msgs = res.data.data;
      console.log(msgs);

      //Add it to our already found
      let temp_chatMSGINFO = chatMessageInfo;
      temp_chatMSGINFO[idGen1] = msgs;
      setCurrentChatID(idGen1);
      setChatMessageInfo(temp_chatMSGINFO);
      setDisplayMessageLoading(false);
    }
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
                    <>
                      <div className="flex convo" onClick={() => startChat(e)}>
                        <a
                          href={`/${
                            e.data.user1["@ref"].id === ourRef
                              ? e.data.userInfo.u2.server
                              : e.data.userInfo.u1.server
                          }/${
                            e.data.user1["@ref"].id === ourRef
                              ? e.data.userInfo.u2.username
                              : e.data.userInfo.u1.username
                          }`}
                        >
                          <img
                            src={
                              e.data.user1["@ref"].id === ourRef
                                ? e.data.userInfo.u2.pfpic
                                : e.data.userInfo.u1.pfpic
                            }
                            className="convoPfpic"
                          />
                        </a>

                        <p className="convoName">
                          {e.data.user1["@ref"].id === ourRef
                            ? e.data.userInfo.u2.username
                            : e.data.userInfo.u1.username}

                          <span className="convoDesc">
                            {e.data.user1["@ref"].id === ourRef
                              ? `${e.data.userInfo.u2.server}|${e.data.userInfo.u2.grade}|${e.data.userInfo.u2.section}`
                              : `${e.data.userInfo.u1.server}|${e.data.userInfo.u1.grade}|${e.data.userInfo.u1.section}`}
                          </span>
                        </p>
                      </div>
                    </>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="display side-content3">
          <div className="right">
            {/* Top Stuff */}
            <div className="flex">
              <a
                href={`/${activeChatUser.otherGuy.data.server}/${activeChatUser.otherGuy.data.username}`}
              >
                <img
                  src={activeChatUser.otherGuy.data.pfpic}
                  className="chatPfpic"
                />
              </a>
              <div>
                <p className="chatHeading">
                  {activeChatUser.otherGuy.data.username}
                </p>
                <p className="chatDesc">
                  {activeChatUser.otherGuy.data.server}|
                  {activeChatUser.otherGuy.data.grade}|
                  {activeChatUser.otherGuy.data.section}
                </p>
              </div>
            </div>

            {/* Text Box */}
            <div className="activeChatTextBox">
              <motion.img
                src="/plus2_MSGS.png"
                width={20}
                height={20}
                style={{ cursor: "pointer", marginRight: "7px" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
              {/* Actual Input */}
              <input
                className="acInput"
                placeholder="what dy want to say m8?"
                onKeyDown={(e) => msgText(e.key, e.target.value)}
              />

              <motion.img
                src="/gif_M.png"
                width={27}
                height={27}
                style={{ cursor: "pointer" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />

              <motion.img
                src="/emoji_MARKER.png"
                width={27}
                height={27}
                style={{ cursor: "pointer", marginLeft: "5px" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />

              <motion.img
                src="/more_MSGS.png"
                width={27}
                height={27}
                style={{ cursor: "pointer", marginLeft: "5px" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
            </div>

            {displayMessageLoading ? (
              <Loader size={3} />
            ) : (
              <div
                style={{
                  overflow: "auto",
                  display:"flex",
                  flexDirection:"column",
                  flexGrow:"none"
                }}
              >
                {/* Another failsafe :L */}
                {currentChatID !== "" && (
                  <>
                    {chatMessageInfo[currentChatID].map((e, idx) => (
                      <>
                        {e.data.sender === ourRef ? (
                          <div className="ourMessage">
                            <p>{e.data.msg.text}</p>
                          </div>
                        ) : (
                          <div className="theirMessage">
                            <p>{e.data.msg.text}</p>
                          </div>
                        )}
                      </>
                    ))}
                  </>
                )}
              </div>
            )}
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

          .side-content3 {
            margin-left: 653px;
          }

          .content {
            margin-top: 0px;
            position: absolute;
            width: 350px;
            min-height: 95%;

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
            overflow: none;
          }

          .flex {
            display: flex;
            align-items: center;
          }

          .convo {
            margin-top: 10px;
            cursor: pointer;
          }

          .convoPfpic {
            width: 45px;
            height: 45px;
            border-radius: 50%;
          }

          .convoName {
            margin-left: 10px;
            font-weight: 500;
            font-family: var(--mainfont);
          }

          .convoDesc {
            margin-left: 30px;
            color: grey;
            font-weight: 200;
            font-size: 0.9em;
          }

          .right {
            padding-left: 10px;
            padding-top: 10px;
            padding-right: 10px;
            position: fixed;
          }

          .chatPfpic {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
          }

          .chatHeading {
            margin-top: 0px;
            margin-bottom: 0px;
            padding-left: 5px;
            font-size: 1.4em;
            font-weight: 600;
          }

          .chatDesc {
            margin-top: 0px;
            font-size: 0.8em;
            color: grey;
            padding-left: 5px;
          }

          .activeChatTextBox {
            display: flex;
            position: fixed;
            align-items: center;
            z-index: 109;
            margin-top: 480px;
            margin-left: 25px;
            padding-left: 10px;
            background-color: white;
            border: 1px solid black;
            width: 620px;
            height: 48px;
          }

          .acInput {
            outline: none;
            border: none;
            font-family: var(--mainfont);
            font-size: 0.9em;
            width: 80%;
          }

          .acIcon {
            cursor: pointer;
          }
        `}
      </style>
    </>
  );
}
