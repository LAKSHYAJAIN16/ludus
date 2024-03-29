import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { motion } from "framer-motion";
import { query, collection, where, onSnapshot } from "firebase/firestore";

import db from "../../lib/firebase";
import sleep from "../../lib/sleep";
import isInViewport from "../../lib/isInViewport";
import Navbar from "../../components/Navbar";
import Loader from "../../components/Loader";
import LoadingModal from "../../components/LoadingModal";
import EMOJIS from "../../lib/idToEmoji";
import bytesToNomen from "../../lib/bytesToNomen";

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
  const [fireMessageIDS, setFireMessageIDS] = useState([]);
  const [currentChatID, setCurrentChatID] = useState("");

  //Gif Menu Variables
  const [gifMenuItems, setGifMenuItems] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [gifSuggestions, setGifSuggestions] = useState([]);
  const [loadingGifGrid, setLoadingGifGrid] = useState(false);

  //Emoji Menu Variables
  const [recentEmojis, setRecentEmojis] = useState([]);

  //Our User
  const [ourUser, setOurUser] = useState();
  const [ourRef, setOurRef] = useState();

  //UI vars
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [displayAddModal, setDisplayAddModal] = useState(false);
  const [displayLoadingModal, setDisplayLoadingModal] = useState(false);
  const [displayMessageLoading, setDisplayMessageLoading] = useState(false);
  const [renderGifMenu, setRenderGifMenu] = useState(false);
  const [renderEmojiMenu, setRenderEmojiMenu] = useState(false);
  const [renderPlusMenu, setRenderPlusMenu] = useState(false);

  //Dev :L
  const [called, setCalled] = useState(false);

  useEffect(() => {
    const run = async () => {
      //Set Users
      const temp_user = JSON.parse(localStorage.getItem("u_u"));
      const temp_ref = JSON.parse(localStorage.getItem("u_ref"))["@ref"].id;
      setOurUser(temp_user);
      setOurRef(temp_ref);

      //Set Recent Emojis
      const rRecentEmojis = JSON.parse(localStorage.getItem("rE") || "[]");
      setRecentEmojis(rRecentEmojis);

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
      const snapyBoi = onSnapshot(q, async (querySnapshot) => {
        if (initialQuery === true) {
          initialQuery = false;
        } else {
          //Get docChanges
          const docChanges = querySnapshot.docChanges();
          snapListener(docChanges, temp_ref);
        }
      });

      //Get Top Gifs
      getTopGifStuff();

      //Dev :L
      setCalled(true);
    };

    if (called === false) {
      run();
    }
  }, []);

  async function snapListener(docChanges, uID) {
    for (let index = 0; index < docChanges.length; index++) {
      const docChange = docChanges[index];

      if (docChange.type === "added") {
        //Get the actual Doc
        const docData = docChange.doc.data();

        //First, check if there is already a FireDoc with the same id (ikr firebase)
        let found = false;
        for (let i = 0; i < fireMessageIDS.length; i++) {
          const id = fireMessageIDS[i];
          if (id === docChange.doc.id) {
            found = true;
          }
        }

        if (found === true) {
          console.log("Already have that msg LUL");
        } else if (found === false) {
          //Add to Fire Messages
          let fire = fireMessageIDS;
          fire.push(docChange.doc.id);
          setFireMessageIDS(fire);

          //Add to the chatMessageInfo (JAVASCRIPT!)
          let curChat = chatMessageInfo;
          curChat[docData.channel].push({ data: docData });
          setChatMessageInfo(curChat);

          //Get our other users and see if they match
          let quer1 = docData.sender == uID ? docData.reciever : docData.sender;
          let quer2 = sessionStorage.getItem("act_chat");

          if (quer2 === quer1) {
            console.log("WORKS BOI!");

            //The Weird stuff
            setDisplayMessageLoading(true);
            await sleep(0.001);
            setDisplayMessageLoading(false);

            //Scroll into view (ikr javascript)
            await sleep(0.005);
            document
              .getElementById(`clown-${curChat[docData.channel].length - 1}`)
              .scrollIntoView({ behavior: "auto" });
          } else {
            //Add that unread messages thing
            console.log("it aint gonna work");
          }
        }
      }
    }
  }

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

    //Save Reference to session storage
    sessionStorage.setItem("act_chat", otherGuy.ref["@ref"].id);

    //Now actually get the messages lol
    getAllMessages(e.data.user1["@ref"].id, e.data.user2["@ref"].id);
  }

  async function msgText(key, txt, element) {
    if (key === "Enter") {
      //Filter for Emoticons
      const actText = lookForEmoticons(txt);

      //Create Payload
      const payload = {
        msg: {
          type: "text",
          text: actText,
        },
        sender: activeChatUser.ourGuy.ref["@ref"].id,
        reciever: activeChatUser.otherGuy.ref["@ref"].id,
      };

      //Reset TXT Input value
      element.value = "";

      //Add to the chatMessageInfo (JAVASCRIPT!)
      setDisplayMessageLoading(true);
      let curChat = chatMessageInfo;
      curChat[currentChatID].push({ data: payload });
      setChatMessageInfo(curChat);
      await sleep(0.001);
      setDisplayMessageLoading(false);

      //Scroll into view (ikr javascript)
      await sleep(0.001);
      document
        .getElementById(`clown-${curChat[currentChatID].length - 1}`)
        .scrollIntoView({ behavior: "auto" });

      //Firebase realtime backend
      const res2 = await axios.post(
        `/api/create/dms/fire-msg?channel=${currentChatID}`,
        payload
      );
      console.log(res2);

      //API (fauna backend)
      const res = await axios.post("/api/create/dms/fauna-msg", payload);
      console.log(res);
    } else {
      const n = lookForEmoticons(txt);
      if (n != txt) {
        element.value = n;
      }
    }
  }

  async function msgGif(gif) {
    //Create Payload
    const payload = {
      msg: {
        type: "gif",
        gif: gif,
      },
      sender: activeChatUser.ourGuy.ref["@ref"].id,
      reciever: activeChatUser.otherGuy.ref["@ref"].id,
    };

    //Add to the chatMessageInfo (JAVASCRIPT!)
    setDisplayMessageLoading(true);
    let curChat = chatMessageInfo;
    curChat[currentChatID].push({ data: payload });
    setChatMessageInfo(curChat);
    await sleep(0.001);
    setDisplayMessageLoading(false);

    //Scroll into view (ikr javascript)
    await sleep(0.001);
    document
      .getElementById(`clown-${curChat[currentChatID].length - 1}`)
      .scrollIntoView({ behavior: "auto" });

    //Hide the Gif Panel
    setRenderGifMenu(false);

    //Firebase realtime backend
    const res2 = await axios.post(
      `/api/create/dms/fire-msg?channel=${currentChatID}`,
      payload
    );
    console.log(res2);

    //API (fauna backend)
    const res = await axios.post("/api/create/dms/fauna-msg", payload);
    console.log(res);
  }

  async function msgImage(file) {
    //Assemble formdata
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "cdkq7wce");

    //Cloudinary
    const res1 = await axios.post(
      "https://api.cloudinary.com/v1_1/everything-limited/auto/upload",
      formData
    );

    //Create Payload
    const payload = {
      msg: {
        type: "image",
        image: {
          url: res1.data.url,
          asset_id: res1.data.asset_id,
          dimensions: {
            width: res1.data.width,
            height: res1.data.height,
          },
          format: res1.data.format,
          url: res1.data.url,
        },
      },
      sender: activeChatUser.ourGuy.ref["@ref"].id,
      reciever: activeChatUser.otherGuy.ref["@ref"].id,
    };
    console.log(payload);

    //Add to the chatMessageInfo (JAVASCRIPT!)
    setDisplayMessageLoading(true);
    let curChat = chatMessageInfo;
    curChat[currentChatID].push({ data: payload });
    setChatMessageInfo(curChat);
    await sleep(0.001);
    setDisplayMessageLoading(false);

    //Scroll into view (ikr javascript)
    await sleep(0.001);
    document
      .getElementById(`clown-${curChat[currentChatID].length - 1}`)
      .scrollIntoView({ behavior: "auto" });

    //Firebase realtime backend
    const res2 = await axios.post(
      `/api/create/dms/fire-msg?channel=${currentChatID}`,
      payload
    );
    console.log(res2);

    //API (fauna backend)
    const res = await axios.post("/api/create/dms/fauna-msg", payload);
    console.log(res);
  }

  async function msgVideo(file) {
    // Create Proxy URL
    const proxy = URL.createObjectURL(file);

    //Assemble semi-payload
    const semiPayload = {
      msg: {
        type: "video",
        video: proxy,
      },
      sender: activeChatUser.ourGuy.ref["@ref"].id,
      reciever: activeChatUser.otherGuy.ref["@ref"].id,
    };

    //Add to the chatMessageInfo (JAVASCRIPT!)
    setDisplayMessageLoading(true);
    let curChat = chatMessageInfo;
    curChat[currentChatID].push({ data: semiPayload });
    setChatMessageInfo(curChat);
    await sleep(0.001);
    setDisplayMessageLoading(false);

    //Scroll into view (ikr javascript)
    await sleep(0.001);
    document
      .getElementById(`clown-${curChat[currentChatID].length - 1}`)
      .scrollIntoView({ behavior: "auto" });

    //Assemble formdata
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "cdkq7wce");

    //Cloudinary
    const res1 = await axios.post(
      "https://api.cloudinary.com/v1_1/everything-limited/auto/upload",
      formData
    );

    //Now, Assemble actual payload
    const actualPayload = {
      msg: {
        type: "video",
        video: res1.data.url,
      },
      sender: activeChatUser.ourGuy.ref["@ref"].id,
      reciever: activeChatUser.otherGuy.ref["@ref"].id,
    };

    //Firebase realtime backend
    const res2 = await axios.post(
      `/api/create/dms/fire-msg?channel=${currentChatID}`,
      actualPayload
    );
    console.log(res2);

    //API (fauna backend)
    const res = await axios.post("/api/create/dms/fauna-msg", actualPayload);
    console.log(res);
  }

  async function msgFile(file) {
    //Assemble formdata
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "cdkq7wce");

    //Cloudinary
    const res1 = await axios.post(
      "https://api.cloudinary.com/v1_1/everything-limited/auto/upload",
      formData
    );

    //Create Payload
    const payload = {
      msg: {
        type: "file",
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: res1.data.url,
        },
      },
      sender: activeChatUser.ourGuy.ref["@ref"].id,
      reciever: activeChatUser.otherGuy.ref["@ref"].id,
    };
    console.log(payload);

    //Add to the chatMessageInfo (JAVASCRIPT!)
    setDisplayMessageLoading(true);
    let curChat = chatMessageInfo;
    curChat[currentChatID].push({ data: payload });
    setChatMessageInfo(curChat);
    await sleep(0.001);
    setDisplayMessageLoading(false);

    //Scroll into view (ikr javascript)
    await sleep(0.001);
    document
      .getElementById(`clown-${curChat[currentChatID].length - 1}`)
      .scrollIntoView({ behavior: "auto" });

    //Firebase realtime backend
    const res2 = await axios.post(
      `/api/create/dms/fire-msg?channel=${currentChatID}`,
      payload
    );
    console.log(res2);

    //API (fauna backend)
    const res = await axios.post("/api/create/dms/fauna-msg", payload);
    console.log(res);
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

  async function getTopGifStuff() {
    //Top GIFS
    const ENDPOINT = "https://g.tenor.com/v1/trending?key=QK8FF5TD7JOM&limit=9";
    const res = await axios.get(ENDPOINT);
    const objects = res.data.results;
    const returnA = [];
    for (let i = 0; i < objects.length; i++) {
      const e = objects[i].media[0];
      returnA.push(e.gif);
    }
    setGifMenuItems(returnA);

    //Top SearchTerms
    const ENDPOINT2 =
      "https://g.tenor.com/v1/trending_terms?key=QK8FF5TD7JOM&limit=4";
    const res2 = await axios.get(ENDPOINT2);
    const returnB = res2.data.results;
    setGifSuggestions(returnB);
  }

  async function gifOperate(value) {
    //Top SearchTerms
    const ENDPOINT2 = `https://g.tenor.com/v1/autocomplete?q=${value}&key=QK8FF5TD7JOM&limit=4`;
    const res2 = await axios.get(ENDPOINT2);
    const returnB = res2.data.results;
    setGifSuggestions(returnB);

    //Actual Gifs
    setLoadingGifGrid(true);
    const ENDPOINT = `https://g.tenor.com/v1/search?q=${value}&key=QK8FF5TD7JOM&limit=9`;
    const res = await axios.get(ENDPOINT);
    const objects = res.data.results;
    const returnA = [];
    for (let i = 0; i < objects.length; i++) {
      const e = objects[i].media[0];
      returnA.push(e.gif);
    }
    console.log(returnA);
    setGifMenuItems(returnA);
    setLoadingGifGrid(false);
  }

  async function assignSuggestions(val) {
    const gifInput = document.getElementById("gifInputThingy");
    gifInput.value = val;

    //Actual Gifs
    setLoadingGifGrid(true);
    const ENDPOINT = `https://g.tenor.com/v1/search?q=${val}&key=QK8FF5TD7JOM&limit=9`;
    const res = await axios.get(ENDPOINT);
    const objects = res.data.results;
    const returnA = [];
    for (let i = 0; i < objects.length; i++) {
      const e = objects[i].media[0];
      returnA.push(e.gif);
    }
    console.log(returnA);
    setGifMenuItems(returnA);
    setLoadingGifGrid(false);
  }

  function lookForEmoticons(txt) {
    let n = txt;

    //All Combinations
    const combinations = [
      { t: ":)", e: "😊" },
      { t: ";)", e: "😉" },
      { t: "=)", e: "😀" },
      { t: ":-)", e: "😊" },
      { t: ":]", e: "😊" },
      { t: ":-]", e: "😊" },
      { t: ":^)", e: "😁" },
      { t: "=3", e: "😍" },
      { t: "B^D", e: "😄" },
      { t: "8D", e: "😄" },
      { t: "x-D", e: "😆" },
      { t: "X-D", e: "😆" },
      { t: "xd", e: "😆" },
      { t: "xD", e: "😆" },
      { t: "Xd", e: "😆" },
      { t: "XD", e: "😆" },
      { t: ":x", e: "😘" },
    ];

    for (let i = 0; i < combinations.length; i++) {
      const e = combinations[i];
      n = n.replace(e.t, e.e);
    }

    return n;
  }

  function scrollCallback() {
    const curChat = chatMessageInfo;
    if (curChat === {}) return;

    const len = curChat[currentChatID].length - 1;
    const element = document.getElementById(`clown-${len}`);
    console.log(isInViewport(element));
  }

  function addEmoji(emoji_id) {
    //Get Textbox
    const textBox = document.getElementById("actInputHAHA");

    //Add it and focus
    const val = EMOJIS[emoji_id];
    textBox.value += val;
    textBox.focus();

    //Get the Recent Emojis
    let x = recentEmojis;

    //First, check if there is an object with our emoji already
    let found = false;
    for (let i = 0; i < x.length; i++) {
      const category = x[i];
      if (category.id === emoji_id) {
        //Set Found to true
        found = true;

        //INcrement count
        category.count += 1;

        //Increment last timestamp
        category.last = Date.now();

        //Change the array!
        x[i] = category;
        break;
      }
    }

    //If we haven't found it
    if (found === false) {
      x.push({
        id: emoji_id,
        last: Date.now(),
        count: 1,
      });
    }

    //Sort X
    x = x.sort(function (a, b) {
      return b.last - a.last;
    });
    x.splice(24);
    setRecentEmojis(x);

    //Push it to Local Storage
    localStorage.setItem("rE", JSON.stringify(x));
  }

  function download(url, filename) {
    var link = document.createElement("a");
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const Emoji = ({ id }) => (
    <Image
      src={`/x/${id}.png`}
      width={35}
      height={35}
      style={{ cursor: "pointer", marginLeft: "5px" }}
      onClick={() => addEmoji(id)}
    />
  );

  const VideoPlayerLudus = ({ src }) => {
    const [mouseIsOver, setMouseIsOver] = useState(false);

    return (
      <div
        onMouseEnter={(e) => setMouseIsOver(true)}
        onMouseLeave={() => setMouseIsOver(false)}
      >
        <video
          src={src}
          controls={mouseIsOver}
          style={{ maxWidth: "400px" }}
        ></video>
      </div>
    );
  };

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

            {/* Gif Menu */}
            {renderGifMenu && (
              <motion.div
                className="gifMenu"
                animate={{ opacity: 1 }}
                transition={{
                  opacity: {
                    type: "spring",
                    duration: 0.05,
                    mass: 1,
                    stiffness: 100,
                    damping: 10,
                  },
                }}
              >
                {/* Text Input */}
                <input
                  className="gifInput"
                  placeholder="Search for a Gif..."
                  id="gifInputThingy"
                  onKeyDown={(e) => gifOperate(e.target.value)}
                  onFocus={(e) => setShowSuggestions(true)}
                />

                {/* Suggestions */}
                {showSuggestions === true ? (
                  <>
                    <div className="suggestions">
                      {gifSuggestions.map((e, idx) => (
                        <>
                          <motion.div
                            className="suggestion"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 1.1 }}
                            onClick={() => assignSuggestions(e)}
                          >
                            <span>{e}</span>
                          </motion.div>
                        </>
                      ))}
                    </div>
                    <br />
                    <br />
                    <br />
                  </>
                ) : (
                  <>
                    <br />
                    <br />
                  </>
                )}

                {/* The GIFS */}
                {!loadingGifGrid && (
                  <div className="gif-wrapper">
                    <div className="gifs">
                      {gifMenuItems.map((e, idx) => (
                        <motion.div
                          className="gif"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => msgGif(e)}
                        >
                          <img
                            src={e.url}
                            // width={e.dims[0] * 0.2}
                            // height={e.dims[1] * 0.2}
                            width={100}
                            height={90}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Emoji Menu */}
            {renderEmojiMenu && (
              <motion.div
                className="gifMenu"
                animate={{ opacity: 1 }}
                transition={{
                  opacity: {
                    type: "spring",
                    duration: 0.05,
                    mass: 1,
                    stiffness: 100,
                    damping: 10,
                  },
                }}
                style={{ alignItems: "normal" }}
              >
                {/* Text Input */}
                <input
                  className="gifInput"
                  placeholder="Search for an Emoji..."
                  id="emojiInputThingy"
                  style={{ marginLeft: "12.5px" }}
                />

                {/* Recent Emojis */}
                <br />
                <br />
                <div>
                  <p className="emojiHeader">Recent</p>

                  <div
                    style={{
                      paddingLeft: "10px",
                      display: "flex",
                      paddingRight: "10px",
                      justifyContent: "space-evenly",
                      flexWrap: "wrap",
                    }}
                  >
                    {recentEmojis.map((e) => (
                      <>
                        <Emoji id={e.id} />
                      </>
                    ))}
                  </div>
                </div>

                {/* People & Faces */}
                <div>
                  <p className="emojiHeader">People & Faces</p>
                  <div
                    style={{
                      paddingLeft: "10px",
                      display: "flex",
                      paddingRight: "10px",
                      justifyContent: "space-evenly",
                      flexWrap: "wrap",
                    }}
                  >
                    <Emoji id="1" />
                    <Emoji id="2" />
                    <Emoji id="3" />
                    <Emoji id="4" />
                    <Emoji id="5" />
                    <Emoji id="6" />
                    <Emoji id="7" />
                    <Emoji id="8" />
                    <Emoji id="9" />
                    <Emoji id="10" />
                    <Emoji id="11" />
                    <Emoji id="12" />
                    <Emoji id="13" />
                    <Emoji id="14" />
                    <Emoji id="16" />
                    <Emoji id="17" />
                    <Emoji id="18" />
                    <Emoji id="19" />
                    <Emoji id="20" />
                    <Emoji id="21" />
                    <Emoji id="22" />
                    <Emoji id="23" />
                    <Emoji id="24" />
                    <Emoji id="25" />
                    <Emoji id="26" />
                    <Emoji id="27" />
                    <Emoji id="28" />
                    <Emoji id="29" />
                    <Emoji id="30" />
                    <Emoji id="31" />
                    <Emoji id="32" />
                    <Emoji id="33" />
                    <Emoji id="34" />
                    <Emoji id="35" />
                    <Emoji id="36" />
                    <Emoji id="37" />
                    <Emoji id="38" />
                    <Emoji id="39" />
                    <Emoji id="43" />
                    <Emoji id="44" />
                    <Emoji id="45" />
                    <Emoji id="46" />
                    <Emoji id="47" />
                    <Emoji id="48" />
                    <Emoji id="49" />
                    <Emoji id="50" />
                    <Emoji id="51" />
                    <Emoji id="52" />
                    <Emoji id="53" />
                    <Emoji id="54" />
                    <Emoji id="55" />
                    <Emoji id="56" />
                    <Emoji id="57" />
                    <Emoji id="58" />
                    <Emoji id="59" />
                    <Emoji id="60" />
                    <Emoji id="61" />
                    <Emoji id="62" />
                    <Emoji id="63" />
                    {/* <Emoji id="64" />
                    <Emoji id="65" />
                    <Emoji id="66" />
                    <Emoji id="67" />
                    <Emoji id="68" />
                    <Emoji id="69" /> */}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Plus Menu */}
            {renderPlusMenu && (
              <motion.div
                className="plusMenu"
                animate={{ opacity: 1 }}
                transition={{
                  opacity: {
                    type: "spring",
                    duration: 0.05,
                    mass: 1,
                    stiffness: 100,
                    damping: 10,
                  },
                }}
                style={{ alignItems: "normal" }}
              >
                <input
                  type="file"
                  id="image-input"
                  style={{ display: "none" }}
                  accept=".jpg,.jpeg,.png,.ico,.gif"
                  onChange={(e) => msgImage(e.target.files[0])}
                />
                <label htmlFor="image-input">
                  <div className="plusDiv">
                    <Image src="/image_ULU.png" width={20} height={20} />
                    <span className="plusADD">Add Image</span>
                  </div>
                </label>

                <input
                  type="file"
                  id="video-input"
                  style={{ display: "none" }}
                  accept=".mp4"
                  onChange={(e) => msgVideo(e.target.files[0])}
                />
                <label htmlFor="video-input">
                  <div className="plusDiv">
                    <Image src="/video_ULU.png" width={20} height={20} />
                    <span className="plusADD">Add Video</span>
                  </div>
                </label>

                <input
                  type="file"
                  id="file-input"
                  style={{ display: "none" }}
                  onChange={(e) => msgFile(e.target.files[0])}
                />
                <label htmlFor="file-input">
                  <div className="plusDiv">
                    <Image src="/file_ULU.png" width={20} height={20} />
                    <span className="plusADD">Add File</span>
                  </div>
                </label>
              </motion.div>
            )}

            {/* Text Box */}
            <div className="activeChatTextBox">
              {/* Plus Icon */}
              <motion.img
                src="/plus2_MSGS.png"
                width={20}
                height={20}
                style={{ cursor: "pointer", marginRight: "7px" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRenderPlusMenu(!renderPlusMenu)}
              />

              {/* Actual Input */}
              <input
                className="acInput"
                placeholder="what dy want to say m8?"
                id="actInputHAHA"
                onKeyDown={(e) => msgText(e.key, e.target.value, e.target)}
              />

              <motion.img
                src="/gif_M.png"
                width={27}
                height={27}
                style={{ cursor: "pointer" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRenderGifMenu(!renderGifMenu)}
              />

              <motion.img
                src="/emoji_MARKER.png"
                width={27}
                height={27}
                style={{ cursor: "pointer", marginLeft: "5px" }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRenderEmojiMenu(!renderEmojiMenu)}
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

            {/* Messages */}
            {displayMessageLoading === true ? (
              <Loader size={3} />
            ) : (
              <div className="messages" onScroll={() => scrollCallback()}>
                <br />
                <br />
                {/* Another failsafe :L */}
                {currentChatID !== "" && (
                  <>
                    {chatMessageInfo[currentChatID].map((e, idx) => (
                      <>
                        <div
                          className={`msg ${
                            e.data.sender === ourRef ? "rightMSG" : "leftMSG"
                          }`}
                          id={`clown-${idx}`}
                          style={
                            e.data.msg.type === "text"
                              ? {}
                              : {
                                  marginTop: "0px",
                                  paddingTop: "20px",
                                  paddingBottom: "20px",
                                  display: "block",
                                }
                          }
                        >
                          {e.data.msg.type === "text" && (
                            <p>{e.data.msg.text}</p>
                          )}

                          {e.data.msg.type === "gif" && (
                            <>
                              <img
                                src={e.data.msg.gif.url}
                                style={{
                                  maxWidth: "400px",
                                  maxHeight: "400px",
                                }}
                              />
                            </>
                          )}

                          {e.data.msg.type === "image" && (
                            <>
                              <img
                                src={e.data.msg.image.url}
                                style={{
                                  maxWidth: "400px",
                                  maxHeight: "400px",
                                }}
                              />
                            </>
                          )}

                          {e.data.msg.type === "video" && (
                            <>
                              <VideoPlayerLudus src={e.data.msg.video} />
                            </>
                          )}

                          {e.data.msg.type === "file" && (
                            <div
                              className="flex"
                              style={{ cursor: "pointer" }}
                              onClick={() =>
                                download(e.data.msg.file.url, e.data.msg.file.name)
                              }
                            >
                              <Image
                                src="/txt_L.png"
                                width={40}
                                height={40}
                                style={{
                                  marginTop: "0px",
                                  marginBottom: "0px",
                                }}
                              />
                              <div className="file-box-right">
                                <p className="file-name">
                                  {e.data.msg.file.name}
                                </p>
                                <p className="file-size">
                                  {bytesToNomen(e.data.msg.file.size)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        <div
                          style={{ display: "inline-block", width: "100%" }}
                        />
                        <br />
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
};