import axios from "axios";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { motion } from "framer-motion";

import Navbar from "../../components/Navbar";
import EMOTION_TO_IMAGE from "../../lib/emotionVars";

export default function Post() {
  const [post, setPost] = useState({
    data: {
      userInfo: {
        pfpic: "",
      },
    },
  });

  const [reactions, setReactions] = useState([]);
  const [uiReactions, setUiReactions] = useState([]);

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

      console.log(finished);
      setUiReactions(finished);
    };
    run();
  }, []);

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

            <p className="text">{post.data.text}</p>

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
        `}
      </style>
    </>
  );
}
