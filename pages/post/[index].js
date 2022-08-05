import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import moment from "moment";
import { motion } from "framer-motion";

import Navbar from "../../components/Navbar";
import Loader from "../../components/Loader";
import s from "../../lib/s";
import calculateMargins from "../../lib/calculuateMargins";
import EMOTION_TO_IMAGE from "../../lib/emotionVars";
import calculateDimentions from "../../lib/calculateDimentions";

export default function Post() {
  const [post, setPost] = useState({
    data: {
      userInfo: {
        pfpic: "",
      },
    },
  });

  //Dimensions
  const [dims, setDims] = useState({});

  //Reaction Bufs
  const [reactions, setReactions] = useState([]);
  const [uiReactions, setUiReactions] = useState([]);

  //Zoom Vars
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(1);

  //Comments
  const [loadingCommentInput, setLoadingCommentInput] = useState(false);
  const [comments, setComments] = useState([]);

  //Our User
  const [ourUser, setOurUser] = useState({});

  //Refs for elements
  const commentInputRef = useRef();

  useEffect(() => {
    const run = async () => {
      //Get URL Path
      const temp_id = window.location.pathname.replace("/post/", "");

      //Get Post
      const res = await axios.get(`/api/get/posts/byID?id=${temp_id}`);
      setPost(res.data);
      console.log(res);

      //Get Reactions
      const res2 = await axios.get(`/api/get/reactions/onpost?id=${temp_id}`);
      const ourReactions = res2.data.data;
      setReactions(ourReactions);

      //Take 4 unique reactions
      let j = 0;
      let done = false;
      const finished = [];
      for (let k = 0; k < ourReactions.length; k++) {
        if (j >= 5) break;
        const emotion = ourReactions[k].data.emotion;
        if (finished.includes(emotion) === false) {
          finished.push(emotion);
          j += 1;
        }
      }

      setUiReactions(finished);

      //Calculate Dimensions
      if (res.data.data.type === "media") {
        const dimensions = calculateDimentions(
          res.data.data.image.dimensions.height,
          res.data.data.image.dimensions.width,
          700,
          700
        );
        setDims(dimensions);
      }

      if (res.data.data.type === "gif") {
        const dimensions = calculateDimentions(
          res.data.data.gif.dimensions.height,
          res.data.data.gif.dimensions.width,
          700,
          700
        );
        setDims(dimensions);
      }

      //Get Comment Data
      const commentData = await axios.get(
        `/api/get/comments/each-post?id=${temp_id}`
      );
      const actComData = commentData.data.data;
      setComments(actComData);

      //Get our User
      const temp_ourUser = JSON.parse(localStorage.getItem("u_u"));
      setOurUser(temp_ourUser);
    };
    run();
  }, []);

  const initiateZoom = () => {
    // window.history.pushState(
    //   {},
    //   "Zooming in",
    //   `${window.location}?zoomed=true`
    // );
    setZoomPercent(1);
    setShowZoom(true);
  };

  const stopZoom = () => {
    const a = `${window.location.href}`;
    const d = a.replace("?zoom=true", "");
    // window.history.pushState({}, "Post : dash dash dash", d);
    setZoomPercent(1);
    setShowZoom(false);
  };

  const commentFN = async (e) => {
    setLoadingCommentInput(true);
    //Stop Reload
    e.preventDefault();

    //Get FormData (bit overkill with this method but eh)
    const form = new FormData(e.target);
    const formData = Object.fromEntries(form.entries());
    const txt = formData.commentInput;

    //Remove text from ui
    commentInputRef.current.value = "";

    //Disable button
    document.getElementById("cRB").disabled = true;

    //Unfocus
    const tmp = document.createElement("input");
    document.body.appendChild(tmp);
    tmp.style.position = "fixed";
    tmp.focus();
    document.body.removeChild(tmp);

    //Compile Payload
    const payload = {
      userID: JSON.parse(localStorage.getItem("u_ref"))["@ref"].id,
      postID: post.ref["@ref"].id,
      text: txt,
      userInfo: {
        server: ourUser.serverName,
        name: ourUser.username,
        pfpic: ourUser.pfpic,
      },
    };

    //API
    const res = await axios.post("/api/create/comment", payload);
    console.log(res);

    setLoadingCommentInput(false);
    document.getElementById("cRB").disabled = false;
  };

  const ANIM_VARIANTS = {
    zoom: {
      scale: 1.6,
    },
    unZoom: {
      scale: 1,
    },
    intro: {
      opacity: 1,
    },
  };

  return (
    <>
      <div className="main">
        <Navbar />

        <div className="side-content content">
          <h1 className="heading">
            <a href="/o/home">
              <span style={{ fontWeight: 800, cursor: "pointer" }}>←</span>
            </a>{" "}
            Post
          </h1>

          <div className="everything">
            {/* Actual Post stuff */}
            <div className="post">
              <img src={post.data.userInfo.pfpic} className="profilePic" />

              <div className="secondary">
                <p style={{ marginTop: "0px" }}>
                  <span className="username">{post.data.userInfo.name}</span>
                  <br />
                  <span className="toc">{`${post.data.type} post`}</span>
                </p>
              </div>
            </div>

            {/* Text */}
            <p className="text">{post.data.text}</p>

            {/* Image */}
            {post.data.type === "media" && (
              <>
                <motion.img
                  src={post.data.image.url}
                  height={dims.height}
                  width={dims.width}
                  id={`${post.data.id}:img`}
                  style={{ cursor: "zoom-in" }}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 1.02 }}
                  onClick={() => initiateZoom()}
                />
              </>
            )}

            {/* Gif */}
            {post.data.type === "gif" && (
              <>
                <motion.img
                  src={post.data.gif.url}
                  height={dims.height}
                  width={dims.width}
                  id={`${post.data.id}:img`}
                  style={{ cursor: "zoom-in" }}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 1.02 }}
                  onClick={() => initiateZoom()}
                />
              </>
            )}

            {/* Sub Content */}
            <div className="subs">
              <p className="date">
                {moment(post.data.toc).format("H:mm a · MMMM Do, YYYY")}
              </p>

              <div className="reactionUI">
                {uiReactions.map((e, index) => (
                  <>
                    <motion.img
                      src={EMOTION_TO_IMAGE[e]}
                      height={20}
                      width={20}
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        zIndex: index + 30,
                        scale: 1.3,
                        marginLeft: `${index * 15 + 4}px`,
                      }}
                      whileHover={{ scale: 2, zIndex: 999 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  </>
                ))}

                <span className="reactNums">
                  {reactions.length}
                  {reactions.length !== 0 && <span>+</span>} reactions
                </span>

                <span className="comments-counter">
                  {comments.length} comment{s(comments.length)}
                </span>
              </div>
            </div>

            <hr />

            {/* Comment Input thing */}
            <div className="commentUI">
              <img
                src={ourUser.pfpic}
                width={35}
                height={35}
                className="commentPic"
              />
              <form onSubmit={commentFN}>
                <input
                  className="commentInput"
                  type="text"
                  placeholder="what's ur reply?"
                  id="commentInput"
                  name="commentInput"
                  ref={commentInputRef}
                ></input>

                <button className="commentReplyButton" type="submit" id="cRB">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {loadingCommentInput ? (
                      <Loader size={0.4} />
                    ) : (
                      <span>Reply</span>
                    )}
                  </div>
                </button>
              </form>
            </div>

            <br />

            {/* All of the comments */}
            <div className="all-comments">
              {comments.map((e) => (
                <div className="commentSingle">
                  <img
                    src={e.data.userInfo.pfpic}
                    width={35}
                    height={35}
                    className="commentPic"
                  />

                  <div className="commentRight">
                    <p className="commentUsername">
                      <b>{e.data.userInfo.name}</b>{" "}
                      <span style={{ fontSize: "0.8em" }}>
                        {moment(e.data.toc).fromNow()}
                      </span>
                    </p>
                    <p className="commentContent">{e.data.text}</p>
                  </div>

                  <motion.div
                    style={{
                      marginLeft: "300px",
                      position: "absolute",
                      marginTop: "0px",
                      cursor: "pointer",
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Image
                      src="/reply_REA.png"
                      height={14}
                      width={14}
                      onClick={() => setIsEditing(!isEditing)}
                    />
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Zoom */}
      {showZoom && (
        <div className="zoomBlanket">
          <div className="zoomCurtain"></div>
          <p className="zoomX" onClick={() => stopZoom()}>
            X
          </p>
          <div className="zoomImageWrapper">
            {/* Image */}
            {post.data.type === "media" && (
              <>
                <motion.img
                  src={post.data.image.url}
                  className="zoomImage"
                  height={post.data.image.height}
                  width={post.data.image.width}
                  style={{
                    marginLeft: calculateMargins(
                      post.data.image.dimensions.height,
                      post.data.image.dimensions.width
                    ).mW,
                    marginTop: calculateMargins(
                      post.data.image.dimensions.height,
                      post.data.image.dimensions.width
                    ).mH,
                    cursor: zoomPercent === 1.6 ? "zoom-out" : "zoom-in",
                  }}
                  variants={ANIM_VARIANTS}
                  animate={zoomPercent === 1.6 ? "zoom" : "unzoom"}
                  initial="intro"
                  transition={{
                    type: "spring",
                    duration: 0.2,
                    mass: 1,
                    stiffness: 100,
                    damping: 9,
                  }}
                  onClick={() =>
                    zoomPercent === 1.6
                      ? setZoomPercent(1)
                      : setZoomPercent(1.6)
                  }
                />
              </>
            )}

            {/* Gif */}
            {post.data.type === "gif" && (
              <>
                <motion.img
                  src={post.data.gif.url}
                  className="zoomImage"
                  height={post.data.gif.height}
                  width={post.data.gif.width}
                  style={{
                    marginLeft: calculateMargins(
                      post.data.gif.dimensions.height,
                      post.data.gif.dimensions.width
                    ).mW,
                    marginTop: calculateMargins(
                      post.data.gif.dimensions.height,
                      post.data.gif.dimensions.width
                    ).mH,
                    cursor: zoomPercent === 1.6 ? "zoom-out" : "zoom-in",
                  }}
                  variants={ANIM_VARIANTS}
                  animate={zoomPercent === 1.6 ? "zoom" : "unzoom"}
                  initial="intro"
                  transition={{
                    type: "spring",
                    duration: 0.2,
                    mass: 1,
                    stiffness: 100,
                    damping: 9,
                  }}
                  onClick={() =>
                    zoomPercent === 1.6
                      ? setZoomPercent(1)
                      : setZoomPercent(1.6)
                  }
                />
              </>
            )}
          </div>
        </div>
      )}

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

          .post {
            display: flex;
          }

          .profilePic {
            border-radius: 55px;
            border: 1px solid black;
            width: 40px;
            height: 40px;
          }

          .secondary {
            margin-left: 5px;
          }

          .username {
            font-size: 1.2em;
            font-weight: 500;
          }

          .toc {
            font-size: 0.84em;
            color: grey;
          }

          .text {
            margin-left: 5px;
            margin-top: 0px;
            font-size: 1.4em;
            width: 90%;
          }

          .date {
            margin-left: 5px;
            font-weight: 600;
          }

          .reactionUI {
            margin-top: 15px;
            margin-left: 100px;
          }

          .subs {
            display: flex;
          }

          .reactNums {
            margin-left: ${uiReactions.length > 2
              ? uiReactions.length * 20
              : uiReactions.length * 27}px;
          }

          .popup {
            position: absolute;
            display: none;
            margin-top: -20px;
          }

          .zoomBlanket {
            position: fixed;
            z-index: 100;
          }

          .zoomCurtain {
            position: absolute;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.9);
          }

          .zoomImage {
            z-index: 105;
            opacity: 0;
          }

          .zoomImageWrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            -webkit-transform: translate(0%, 0%);
            transform: translate(0%, 0%);
          }

          .zoomX {
            position: absolute;
            margin-top: 10px;
            margin-left: 10px;
            color: white;
            z-index: 103;
            font-family: var(--mainfont);
            font-size: 1.2em;
            font-weight: 300;
            cursor: pointer;
          }

          .comments-counter {
            margin-left: 100px;
          }

          .comments {
            margin-left: 0px;
            padding-left: 0px;
          }

          .commentUI {
            margin-top: 10px;
            display: flex;
            align-items: center;
          }

          .commentPic {
            border-radius: 50%;
            border: 1px solid black;
            width: 45px;
            height: 45px;
          }

          .commentInput {
            margin-left: 0px;
            margin-top: 0px;
            width: 550px;
            border: none;
            background-color: transparent;
            font-size: 1.1em;
            font-family: var(--mainfont);
            background-color: transparent;
            background-size: 10% 3px;
            background-repeat: no-repeat;
            background-position: center 110%;
            transition: all 0.3s ease;
            text-align: center;
          }

          .commentInput:focus {
            outline: none;
          }

          .commentReplyButton {
            margin-top: 10px;
            margin-bottom: 10px;
            color: #fff;
            cursor: pointer;
            height: 40px;
            width: 55px;
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

          .commentSingle {
            margin-top: 20px;
            display: flex;
          }

          .commentRight {
            margin-top: 0px;
            margin-left: 5px;
          }

          .commentUsername {
            margin-top: 0px;
            margin-bottom: 0px !important;
            font-size: 0.95em;
          }

          .commentContent {
            margin-top: 1px;
            width: 540px;
          }
        `}
      </style>
    </>
  );
}
