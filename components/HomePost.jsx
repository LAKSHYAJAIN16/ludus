import React, { useState, useEffect } from "react";
import Image from "next/image";
import moment from "moment";
import axios from "axios";
import { motion } from "framer-motion";

import EMOTION_TO_IMAGE, {
  isNotReg,
  calculateEmoticonCount,
  serializeEmoticonCount,
} from "../lib/emotionVars";
import calculateDimentions from "../lib/calculateDimentions";

export default function HomePost({ post, user }) {
  //Dimensions of the Image
  const [dims, setDims] = useState({});

  //UI State
  const [showReactionMenu, setShowReactionMenu] = useState(false);

  //User Refs
  const [userRef, setUserRef] = useState();

  //Reactions
  const [reactions, setReactions] = useState([]);
  const [uiReactions, setUiReactions] = useState([]);

  useEffect(() => {
    const run = async () => {
      //Calculate Dimensions
      if (post.data.type === "media") {
        const dimensions = calculateDimentions(
          post.data.image.dimensions.height,
          post.data.image.dimensions.width,
          500,
          500
        );
        setDims(dimensions);
      }

      if (post.data.type === "gif") {
        const dimensions = calculateDimentions(
          post.data.gif.dimensions.height,
          post.data.gif.dimensions.width,
          500,
          500
        );
        setDims(dimensions);
      }

      //Set User Refs
      const user_t = JSON.parse(localStorage.getItem("u_ref") || "");
      setUserRef(user_t);

      //Get Reactions
      const reactions = await axios.get(
        `/api/get/reactions/onpost?id=${post.ref["@ref"].id}`
      );
      setReactions(reactions.data.data);

      //Calculate UI
      recalculateReactionUI(reactions.data.data);

      console.log(reactions.data.data);
    };

    run();
  }, []);

  const MAIN_TRANSITON = {
    scale: {
      type: "spring",
      duration: 0.3,
    },
    width: {
      type: "spring",
      duration: 0.3,
      mass: 1,
      stiffness: 100,
      damping: 10,
    },
    height: {
      type: "spring",
      duration: 0.3,
      mass: 1,
      stiffness: 100,
      damping: 10,
    },
  };

  const react = async (emotion) => {
    //UI and SFX
    setShowReactionMenu(false);
    document.getElementById("heart-sfx").play();

    //Get Reactions
    const buf = [];
    for (let i = 0; i < reactions.length; i++) {
      const element = reactions[i];
      buf.push(element);
    }

    buf.push({ data: { emotion: emotion } });
    setReactions(buf);
    recalculateReactionUI(buf);

    //Send Request to API
    const payload = {
      emotion: emotion,
      user: userRef["@ref"]["id"],
      toc: new Date(Date.now()).toISOString(),
      userInfo: {
        username: user.username,
        pfpic: user.pfpic,
      },
      post: post.ref["@ref"].id,
    };
    const res = await axios.post("/api/create/reaction", payload);
  };

  const recalculateReactionUI = (buf) => {
    //Remove duplicates for everyone
    let returnBuf = [];
    let index = {};
    let counts = {};

    //Get Count
    for (let k = 0; k < buf.length; k++) {
      const count = calculateEmoticonCount(buf[k].data.emotion, buf);
      counts[buf[k].data.emotion] = count;
    }

    //Remove Duplicates
    for (let i = 0; i < buf.length; i++) {
      const emotion = buf[i].data.emotion;
      const keys = Object.keys(index);

      let found = false;
      for (let j = 0; j < keys.length; j++) {
        const otherEmotion = keys[j];
        if (otherEmotion === emotion) {
          found = true;
        }
      }

      if (found === true) {
        returnBuf.splice(i, 1);
      } else {
        index[emotion] = "dats right bit";
        returnBuf.push({ em: emotion, co: counts[emotion] });
      }
    }

    console.log({ returnBuf, index, counts });
    setUiReactions(returnBuf);
  };

  const openReactionMenu = () => {
    setShowReactionMenu(!showReactionMenu);
  };

  return (
    <>
      <div className="content">
        {/* IMG */}
        <a href={`/${post.data.userInfo.server}/${post.data.userInfo.name}`}>
          <img
            src={post.data.userInfo.pfpic}
            width={50}
            height={50}
            className="profilePic"
          />
        </a>

        {/* Other Stuff */}
        <div className="secondary">
          <a href={`/post/${post.ref["@ref"].id}`}>
            {/* Name */}
            <p style={{ marginTop: "0px" }}>
              <span className="username">{post.data.userInfo.name}</span>
              <span className="toc">
                {"  " + moment(post.data.toc).fromNow(true)}
              </span>
            </p>

            {/* Text */}
            <p style={{ marginTop: "-10px" }}>{post.data.text}</p>

            {/* Image for Media */}
            {post.data.type === "media" && (
              <>
                <motion.img
                  src={post.data.image.url}
                  height={dims.height}
                  width={dims.width}
                  id={`${post.data.id}:img`}
                  style={{ cursor: "pointer" }}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 1.02 }}
                />
              </>
            )}

            {/* Gif for Gif */}
            {post.data.type === "gif" && (
              <>
                <motion.img
                  src={post.data.gif.url}
                  height={dims.height}
                  width={dims.width}
                  id={`${post.data.id}:img`}
                  style={{ cursor: "pointer" }}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 1.02 }}
                />
              </>
            )}
          </a>

          {/* Reaction Menu */}
          {showReactionMenu && (
            <>
              <motion.div
                animate={{ width: "300px" }}
                transition={MAIN_TRANSITON}
                style={{
                  width: "0px",
                  backgroundColor: "white",
                  height: "30px",
                  borderRadius: "25px",
                  border: "2px solid #25aae1",
                }}
              >
                <motion.img
                  src="/he_REA.png"
                  height={20}
                  width={20}
                  animate={{ width: 20, height: 20 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    cursor: "pointer",
                    marginLeft: "3px",
                    marginTop: "3px",
                    width: 0,
                    height: 0,
                  }}
                  transition={MAIN_TRANSITON}
                  onClick={() => react("heartEyes")}
                />

                <motion.img
                  src="/rofl_REA.png"
                  height={20}
                  width={20}
                  animate={{ width: 20, height: 20 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    cursor: "pointer",
                    marginLeft: "3px",
                    marginTop: "3px",
                    width: 0,
                    height: 0,
                  }}
                  transition={MAIN_TRANSITON}
                  onClick={() => react("rofl")}
                />

                <motion.img
                  src="/k_REA.png"
                  height={20}
                  width={20}
                  animate={{ width: 20, height: 20 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    cursor: "pointer",
                    marginLeft: "3px",
                    marginTop: "3px",
                    width: 0,
                    height: 0,
                  }}
                  transition={MAIN_TRANSITON}
                  onClick={() => react("kiss")}
                />

                <motion.img
                  src="/cool_REA.png"
                  height={20}
                  width={20}
                  animate={{ width: 20, height: 20 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    cursor: "pointer",
                    marginLeft: "3px",
                    marginTop: "3px",
                    width: 0,
                    height: 0,
                  }}
                  transition={MAIN_TRANSITON}
                  onClick={() => react("cool")}
                />

                <motion.img
                  src="/sh_REA.png"
                  height={20}
                  width={20}
                  animate={{ width: 20, height: 20 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    cursor: "pointer",
                    marginLeft: "3px",
                    marginTop: "3px",
                    width: 0,
                    height: 0,
                  }}
                  transition={MAIN_TRANSITON}
                  onClick={() => react("shocked")}
                />

                <motion.img
                  src="/emoji_MARKER.png"
                  height={20}
                  width={20}
                  animate={{ width: 20, height: 20 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    cursor: "pointer",
                    marginLeft: "3px",
                    marginTop: "3px",
                    width: 0,
                    height: 0,
                  }}
                  transition={MAIN_TRANSITON}
                  onClick={() => react("smile")}
                />

                <motion.img
                  src="/conf_REA.png"
                  height={20}
                  width={20}
                  animate={{ width: 20, height: 20 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    cursor: "pointer",
                    marginLeft: "3px",
                    marginTop: "3px",
                    width: 0,
                    height: 0,
                  }}
                  transition={MAIN_TRANSITON}
                  onClick={() => react("confused")}
                />

                <motion.img
                  src="/party_REA.png"
                  height={20}
                  width={20}
                  animate={{ width: 20, height: 20 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    cursor: "pointer",
                    marginLeft: "3px",
                    marginTop: "3px",
                    width: 0,
                    height: 0,
                  }}
                  transition={MAIN_TRANSITON}
                  onClick={() => react("party")}
                />

                <motion.img
                  src="/dab_REA.png"
                  height={20}
                  width={20}
                  animate={{ width: 20, height: 20 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    cursor: "pointer",
                    marginLeft: "3px",
                    marginTop: "3px",
                    width: 0,
                    height: 0,
                  }}
                  transition={MAIN_TRANSITON}
                  onClick={() => react("dab")}
                />

                <motion.img
                  src="/cry_REA.png"
                  height={20}
                  width={20}
                  animate={{ width: 20, height: 20 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    cursor: "pointer",
                    marginLeft: "3px",
                    marginTop: "3px",
                    width: 0,
                    height: 0,
                  }}
                  transition={MAIN_TRANSITON}
                  onClick={() => react("cry")}
                />

                <motion.img
                  src="/star_REA.png"
                  height={20}
                  width={20}
                  animate={{ width: 20, height: 20 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    cursor: "pointer",
                    marginLeft: "3px",
                    marginTop: "3px",
                    width: 0,
                    height: 0,
                  }}
                  transition={MAIN_TRANSITON}
                  onClick={() => react("star")}
                />

                <motion.img
                  src="/rShock_REA.png"
                  height={20}
                  width={20}
                  animate={{ width: 20, height: 20 }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    cursor: "pointer",
                    marginLeft: "3px",
                    marginTop: "3px",
                    width: 0,
                    height: 0,
                  }}
                  transition={MAIN_TRANSITON}
                  onClick={() => react("rShock")}
                />
              </motion.div>
            </>
          )}

          {/* Reactions */}
          <div className="reactions">
            <div className="reactionWrapper">
              <motion.img
                src="/h_REA.png"
                height={20}
                width={20}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                style={{ cursor: "pointer", marginRight: "10px" }}
                onClick={() => react("heart")}
              />
              <span style={{ textAlign: "center", marginLeft: "-10px" }}>
                {serializeEmoticonCount(
                  calculateEmoticonCount("heart", reactions)
                )}
              </span>
            </div>

            <div className="reactionWrapper">
              <motion.img
                src="/l_REA.png"
                height={20}
                width={20}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                style={{ cursor: "pointer", marginRight: "10px" }}
                onClick={() => react("like")}
              />
              <span style={{ textAlign: "center", marginLeft: "-10px" }}>
                {serializeEmoticonCount(
                  calculateEmoticonCount("like", reactions)
                )}
              </span>
            </div>

            <div className="reactionWrapper">
              <motion.img
                src="/f_REA.png"
                height={20}
                width={20}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                style={{ cursor: "pointer", marginRight: "10px" }}
                onClick={() => react("fire")}
              />
              <span style={{ textAlign: "center", marginLeft: "-10px" }}>
                {serializeEmoticonCount(
                  calculateEmoticonCount("fire", reactions)
                )}
              </span>
            </div>

            {/* More added on */}
            {uiReactions.length !== 0 && (
              <>
                {uiReactions.map((e) => (
                  <>
                    {isNotReg(e.em) === true && (
                      <>
                        <div className="reactionWrapper">
                          <motion.img
                            src={EMOTION_TO_IMAGE[e.em]}
                            height={20}
                            width={20}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            style={{ cursor: "pointer", marginRight: "10px" }}
                            onClick={() => react(e.em)}
                          />
                          <span
                            style={{ textAlign: "center", marginLeft: "-10px" }}
                          >
                            {e.co}
                          </span>
                        </div>
                      </>
                    )}
                  </>
                ))}
              </>
            )}

            <motion.div
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              style={{ cursor: "pointer", marginLeft: "20px" }}
              onClick={() => openReactionMenu()}
            >
              <Image src="/emoji_MARKER.png" height={20} width={20} />
              <span style={{ marginLeft: "0px" }}>
                {showReactionMenu === false ? "+" : "x"}
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="sfx">
        <audio src="/heart.mp3" id="heart-sfx" />
      </div>

      <style jsx>
        {`
          .content {
            display: flex;
            margin-bottom: 20px;
            min-width: 300px;
          }

          .profilePic {
            border-radius: 25px;
            border: 1px solid black;
          }

          .secondary {
            margin-left: 5px;
          }

          .username {
            font-size: 1em;
            font-weight: 500;
          }

          .toc {
            font-size: 0.7em;
            color: grey;
          }

          .reactions {
            display: flex;
            margin-top: 10px;
          }

          .reactionWrapper {
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
        `}
      </style>
    </>
  );
}
