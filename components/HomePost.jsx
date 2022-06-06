import React, { useState, useEffect } from "react";
import Image from "next/image";
import moment from "moment";
import axios from "axios";
import { motion } from "framer-motion";

import EMOTION_TO_IMAGE, { isNotReg } from "../lib/EMOTION_TO_IMAGE";
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

  useEffect(() => {
    const run = async () => {
      //Calculate Dimensions
      if (post.data.type === "media" || post.data.type === "gif") {
        const dimensions = calculateDimentions(
          post.data.image.dimensions.height,
          post.data.image.dimensions.width,
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
    const temp_reactions = reactions;
    temp_reactions.push(res.data);
    setReactions(temp_reactions);
    console.log(res);
  };

  const openReactionMenu = () => {
    setShowReactionMenu(!showReactionMenu);
  };

  return (
    <>
      <div className="content">
        {/* IMG */}
        <a href={`/${post.data.userInfo.name}`}>
          <img
            src={post.data.userInfo.pfpic}
            width={50}
            height={50}
            className="profilePic"
          />
        </a>

        {/* Other Stuff */}
        <div className="secondary">
          <a href={`/post/${post.data.id}`}>
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
                <img
                  src={post.data.image.url}
                  height={dims.height}
                  width={dims.width}
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
            <motion.img
              src="/h_REA.png"
              height={20}
              width={20}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              style={{ cursor: "pointer", marginRight: "10px" }}
              onClick={() => react("heart")}
            />

            <motion.img
              src="/l_REA.png"
              height={20}
              width={20}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              style={{ cursor: "pointer", marginRight: "10px" }}
              onClick={() => react("like")}
            />

            <motion.img
              src="/f_REA.png"
              height={20}
              width={20}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              style={{ cursor: "pointer", marginRight: "10px" }}
              onClick={() => react("fire")}
            />

            {/* More added on */}
            {reactions.map((e) => (
              <>
                {isNotReg(e.data.emotion) === true && (
                  <>
                    <motion.img
                      src={EMOTION_TO_IMAGE[e.data.emotion]}
                      height={20}
                      width={20}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ cursor: "pointer", marginRight: "10px" }}
                      onClick={() => react(e.data.emotion)}
                    />
                  </>
                )}
              </>
            ))}

            <motion.div
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              style={{ cursor: "pointer", marginLeft: "20px" }}
              onClick={() => openReactionMenu()}
            >
              <Image src="/emoji_MARKER.png" height={20} width={20} />
              <span style={{ marginLeft: "0px" }}>+</span>
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
        `}
      </style>
    </>
  );
}
