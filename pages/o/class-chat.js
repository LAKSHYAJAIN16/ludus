import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { motion } from "framer-motion";

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

  //SIZE for callback array
  const SIZE = 3;

  useEffect(() => {
    //Get User
    const temp_user = JSON.parse(localStorage.getItem("u_u"));
    setUser(temp_user);
    retrieveMessages(
      0,
      temp_user.grade,
      temp_user.section,
      temp_user.serverName
    );
  }, []);

  const message = async (text) => {
    //Get UID
    const uID = JSON.parse(localStorage.getItem("u_ref"))["@ref"].id;

    //Payload
    const payload = {
      toc: new Date(Date.now()).toISOString(),
      chatState: chatState,
      grade: user.grade,
      section: user.section,
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

    //Create Message
    const res = await axios.post("/api/create/message", payload);
    console.log(res);
  };

  const retrieveMessages = async (num, grade, section, server) => {
    setChatState(num);
    if (num === 0) {
      const res = await axios.get(
        `/api/get/messages/byGrade?grade=${grade}&server=${server}&size=${SIZE}`
      );

      const messages = res.data.data;
      const afterID = res.data.before[0]["@ref"].id;
      setMessagesClass(messages);
      setNextClassCallback(afterID);
      console.log(res);
    }
    if (num === 1) {
      const res = await axios.get(
        `/api/get/messages/bySectionAndGrade?grade=${grade}&server=${server}&section=${section}&size=${SIZE}`
      );

      const messages = res.data.data;
      const afterID = res.data.before[0]["@ref"].id;
      setMessagesSection(messages);
      setNextSectionCallback(afterID);
      console.log(res);
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
            justify-content: center;
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
        `}
      </style>
    </>
  );
}
