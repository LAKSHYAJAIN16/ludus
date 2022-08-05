import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { motion } from "framer-motion";
import moment from "moment";
import io from "socket.io-client";

import Navbar from "../../components/Navbar";

export default function ClassChat() {
  //User State
  const [user, setUser] = useState({ grade: "ERROR", section: "ERROR" });

  //Current Chat State
  const [chatState, setChatState] = useState(0);

  //Text Input Ref
  const textInput = useRef();

  //Messages
  const [messagesClass, setMessagesClass] = useState([]);
  const [messagesSection, setMessagesSection] = useState([]);

  //Nexts
  const [nextClassCallback, setNextClassCallback] = useState("");
  const [nextSectionCallback, setNextSectionCallback] = useState("");

  //Socket
  const [ourSocket, setOurSocket] = useState();
  const [alreadyDid, setAlreadyDid] = useState(false);

  //SIZE for callback array
  const SIZE = 5;

  useEffect(() => {
    const setUserStuff = async() => {
      //Get User
      const temp_user = JSON.parse(localStorage.getItem("u_u"));
      setUser(temp_user);

      //ONLY CALL IT ONCE (DEBUG HAHA)
      if (alreadyDid === false) {
        retrieveMessages(
          0,
          temp_user.grade,
          temp_user.section,
          temp_user.serverName
        );
        setAlreadyDid(true);
      }

      //Get socket
      await fetch("/api/_web_/init-socket");
      const socket = io();

      //Listen to Connect Callback
      socket.on("connect", () => {
        console.log("connected");
      });

      //Listen to new message callback
      socket.on("new-message", (e) => {
        //Parse it
        const e_parsed = JSON.parse(e);
        updateUIONMessage(e_parsed);
      });

      setOurSocket(socket);
    };

    setUserStuff();

    return () => {
      if (ourSocket) {
        ourSocket.close();
      }
    };
  }, []);

  const emitSocket = (code, msg) => {
    ourSocket.emit(code, msg);
  };

  const message = async (text) => {
    //Get UID
    const uID = JSON.parse(localStorage.getItem("u_ref"))["@ref"].id;

    //Payload
    const payload = {
      toc: new Date(Date.now()).toISOString(),
      chatState: chatState,
      grade: user.grade,
      section: chatState === 1 ? user.section : "hahano",
      server: user.serverName,
      text: text,
      userID: uID,
      userInfo: {
        name: user.username,
        server: user.serverName,
        pfpic: user.pfpic,
      },
    };

    //Remove text from Ui Input Field
    textInput.current.value = "";

    //Add to messages Ui
    if (chatState === 0) {
      let buf = [];
      for (let i = 0; i < messagesClass.length; i++) {
        buf.push(messagesClass[i]);
      }
      buf.push({ data: payload });
      setMessagesClass(buf);
    } else if (chatState === 1) {
      let buf = [];
      for (let i = 0; i < messagesSection.length; i++) {
        const element = messagesSection[i];
        buf.push(element);
      }
      buf.push({ data: payload });
      setMessagesSection(buf);
    }

    //Emit Socket Message
    emitSocket("create-message", JSON.stringify(payload));

    // //Create Message
    // const res = await axios.post("/api/create/message", payload);
    // console.log(res);
  };

  const updateUIONMessage = (e_parsed) => {
    //If the user is us, just get tf out
    const name = e_parsed.userInfo.name;
    const server = e_parsed.server;
    const grade = e_parsed.grade;
    const section = e_parsed.section;
    const intent = e_parsed.chatState;

    //User Vars
    const temp_user = JSON.parse(localStorage.getItem("u_u"));
    const user_name = temp_user.username;
    const user_server = temp_user.serverName;
    const user_grade = temp_user.grade;
    const user_section = temp_user.section;

    //MESSAGES
    const msgs = messagesClass;

    // console.log({
    //   name,
    //   server,
    //   grade,
    //   section,
    //   intent,
    //   user_name,
    //   user_grade,
    //   user_section,
    //   user_server,
    // });

    if (server === user_server && name === user_name) return;

    //Check for class messages
    if (server === user_server && grade === user_grade && intent === 0) {
      //Get All Class Messages
      let buf = [];
      for (let i = 0; i < messagesClass.length; i++) {
        const element = messagesClass[i];
        buf.push(element);
      }

      //Check if we already have the same element
      let unique = true;
      for (let j = 0; j < buf.length; j++) {
        const element2 = buf[j];
        if (
          element2.toc === e_parsed.toc &&
          element2.userInfo.name === e_parsed.userInfo.name &&
          element2.text === e_parsed.text
        ) {
          unique = false;
          break;
        }
      }

      if (unique === true) {
        console.log(messagesClass);
        // buf2.push({ data: e_parsed });
        setMessagesClass(msgs);
        console.log("works!");
      } else {
        console.log("NON UNIQUE MESSAGE");
      }
      setMessagesClass(buf);
    }
  };

  const retrieveMessages = async (num, grade, section, server) => {
    console.log("it rendered");
    setChatState(num);
    if (num === 0) {
      const res = await axios.get(
        `/api/get/messages/byGrade?grade=${grade}&server=${server}&size=${SIZE}`
      );

      //Set Messages
      const messages = res.data.data;
      setMessagesClass(messages);

      //Set Next Callback
      try {
        const afterID = res.data.before[0]["@ref"].id;
        setNextClassCallback(afterID);
      } catch (err) {
        setNextClassCallback("nan-boi");
      }
    }
    if (num === 1) {
      const res = await axios.get(
        `/api/get/messages/bySectionAndGrade?grade=${grade}&server=${server}&section=${section}&size=${SIZE}`
      );
      console.log(res.data.data);

      //Set Messages
      const messages = res.data.data;
      setMessagesSection(messages);

      //Set Next Callback
      try {
        const afterID = res.data.before[0]["@ref"].id;
        setNextSectionCallback(afterID);
      } catch (err) {
        setNextSectionCallback("nan-boi");
      }
    }
  };

  return (
    <>
      <div className="main">
        <Navbar />
        <div className="side-content content">
          <div className="topSliders">
            <button
              className="topButton"
              onClick={() =>
                retrieveMessages(0, user.grade, user.section, user.serverName)
              }
            >
              {user.grade}th Grade Chat
            </button>

            <button
              className="topButton"
              onClick={() =>
                retrieveMessages(1, user.grade, user.section, user.serverName)
              }
            >
              {user.grade}
              {user.section} Chat
            </button>
          </div>

          <div className="chat">
            {/* Chat Messages Blah Blah Blah */}
            <div className="classMessages">
              <br />
              {chatState === 0 ? (
                <>
                  {messagesClass.map((e, index) => (
                    <>
                      <div className="message">
                        <img
                          src={e.data.userInfo.pfpic}
                          className="messagepfpic"
                        />

                        <div
                          className="messageRightPart"
                          style={{ marginLeft: "2px" }}
                        >
                          <p style={{ marginTop: "0px", marginBottom: "0px" }}>
                            <span style={{ fontWeight: 700 }}>
                              {e.data.userInfo.name}
                            </span>
                            <span
                              style={{ fontSize: "0.7em", paddingLeft: "4px" }}
                            >
                              {moment(e.data.toc).fromNow(false)}
                            </span>
                          </p>
                          <p style={{ marginTop: "0px" }}>{e.data.text}</p>
                        </div>
                      </div>
                    </>
                  ))}
                </>
              ) : (
                <>
                  {messagesSection.map((e, index) => (
                    <>
                      <div className="message">
                        <img
                          src={e.data.userInfo.pfpic}
                          className="messagepfpic"
                        />

                        <div
                          className="messageRightPart"
                          style={{ marginLeft: "2px" }}
                        >
                          <p style={{ marginTop: "0px", marginBottom: "0px" }}>
                            <span style={{ fontWeight: 700 }}>
                              {e.data.userInfo.name}
                            </span>
                            <span
                              style={{ fontSize: "0.7em", paddingLeft: "4px" }}
                            >
                              {moment(e.data.toc).fromNow(false)}
                            </span>
                          </p>
                          <p style={{ marginTop: "0px" }}>{e.data.text}</p>
                        </div>
                      </div>
                    </>
                  ))}
                </>
              )}
            </div>

            {/* Chat Input */}
            <div className="chatInput">
              {/* Message Input */}
              <input
                className="messageInput"
                placeholder="yo you gonna check out da new BTS album?"
                ref={textInput}
                onKeyDown={(e) =>
                  e.key === "Enter"
                    ? message(textInput.current.value)
                    : console.log("DEBUGGED")
                }
              />

              {/* Emojis, Stickers, GIFS, all dat fun stuff*/}
              <div className="chatUtilsLeft">
                <motion.div
                  className="chatUtil"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.8 }}
                  style={{ marginRight: "3px", scale: 0.9 }}
                >
                  <Image
                    src="/emoji_1M.png"
                    width={25}
                    height={25}
                    style={{ cursor: "pointer" }}
                  />
                </motion.div>

                <motion.div
                  className="chatUtil"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.8 }}
                  style={{ marginRight: "3px", scale: 0.9 }}
                >
                  <Image
                    src="/gif_M.png"
                    width={25}
                    height={25}
                    style={{ cursor: "pointer" }}
                  />
                </motion.div>

                <motion.div
                  className="chatUtil"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.8 }}
                  style={{ marginRight: "3px", scale: 0.9 }}
                >
                  <Image
                    src="/fun_REA.png"
                    width={25}
                    height={25}
                    style={{ cursor: "pointer" }}
                  />
                </motion.div>
              </div>

              <div
                className="sendButton"
                onClick={() => message(textInput.current.value)}
              >
                <Image src="/send_REA.png" width={22.5} height={22.5} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>
        {`
          .content {
            margin-top: 10px;
            position: absolute;
          }

          .topSliders {
            margin-left: 180px;
            display: flex;
          }

          .topButton {
            color: #fff;
            cursor: pointer;
            margin-top: 0px;
            margin-left: 23px;
            margin-right: 23px;
            height: 44px;
            width: 160px;
            border: none;
            background-size: 300% 100%;
            font-weight: 400;
            font-size: 1em;
            font-family: var(--mainfont);
            background-image: linear-gradient(
              to right,
              #25aae1,
              #40e495,
              #30dd8a,
              #2bb673
            );
            box-shadow: 0 4px 15px 0 rgba(49, 196, 190, 0.75);

            border-radius: 50px;
            moz-transition: all 0.4s ease-in-out;
            -o-transition: all 0.4s ease-in-out;
            -webkit-transition: all 0.4s ease-in-out;
            transition: all 0.4s ease-in-out;
          }

          .topButton:hover {
            background-position: 100% 0;
            transform: scale(1.05);
            moz-transition: all 0.4s ease-in-out;
            -o-transition: all 0.4s ease-in-out;
            -webkit-transition: all 0.4s ease-in-out;
            transition: all 0.4s ease-in-out;
          }

          .chat {
            position: relative;
            display: flex;
            margin-left: 170px;
          }

          .chatInput {
            position: fixed;
            margin-top: 440px;
            background-color: white;
            width: 490px;
            height: 40px;
            text-align: center;
            border: 0.5px solid black;
            display: flex;
            align-items: center;
          }

          .chatUtilsLeft {
            display: flex;
            padding-left: 4px;
          }

          .messageInput {
            font-family: var(--mainfont);
            background-color: transparent;
            width: 350px;
            height: 26px;
            padding-left: 20px;
            font-size: 0.9em;
            margin-top: 0px;
            margin-right: 10px;
            border: none;
            outline: none;
            resize: none;
          }

          .sendButton {
            margin-right: 10px;
            cursor: pointer;
            transition: all 500ms ease;
          }

          .sendButton:hover {
            color: green;
          }

          .classMessages {
            position: relative;
          }

          .message {
            display: flex;
            margin-bottom: 10px;
          }

          .messagepfpic {
            height: 40px;
            width: 40px;
            border-radius: 50%;
          }
        `}
      </style>
    </>
  );
}
