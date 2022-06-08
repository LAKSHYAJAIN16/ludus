import axios from "axios";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { motion } from "framer-motion";

import Navbar from "../../components/Navbar";
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
              </div>
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
            margin-left: 200px;
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
        `}
      </style>
    </>
  );
}
