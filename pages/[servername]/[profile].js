import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import s from "../../lib/s";
import Navbar from "../../components/Navbar";
import calculateDimentions from "../../lib/calculateDimentions";

export default function Profile() {
  const [user, setUser] = useState({
    customization: { banner: "", bio: "A Proud ludus user" },
  });
  const [userID, setUserID] = useState();
  const [ourUser, setOurUser] = useState({});

  //1 = Can Follow, 2 = Already Followed, 0 = Same User
  const [followState, setFollowState] = useState(0);

  //Followers
  const [followers, setFollowers] = useState([]);

  //Total Posts
  const [posts, setPosts] = useState([]);
  const [images, setImages] = useState([]);

  //Modal States
  const [modalState, setModalState] = useState(0);
  const [modalImage, setModalImage] = useState({});

  useEffect(() => {
    const run = async () => {
      //Get the Server and the User
      const allArgs = window.location.href.split("/");
      const server = allArgs[3];
      const name = allArgs[4];

      //Call API to get user info
      const res = await axios.get(
        `/api/get/users/byServerAndName?server=${server}&name=${name}`
      );

      //Set the user states
      setUser(res.data.data);
      setUserID(res.data.ref["@ref"].id);

      //Get Our ID
      const our_user = JSON.parse(localStorage.getItem("u_u"));
      const our_data_id = JSON.parse(localStorage.getItem("u_ref"))["@ref"].id;
      const is = our_user.id === res.data.data.id;
      setOurUser(our_user);

      //Call our method to get all of da followers
      const res2 = await axios.get(
        `/api/get/followers/allFollowers?id=${res.data.ref["@ref"].id}`
      );
      setFollowers(res2.data.data);

      //Check if the user logged in and the user we're visiting are the same
      if (is === true) {
        setFollowState(0);
      } else if (is === false) {
        //Loop
        setFollowState(1);
        for (let i = 0; i < res2.data.data.length; i++) {
          const element = res2.data.data[i].data;
          if (element.targetee["@ref"].id === our_data_id) {
            setFollowState(2);
          }
        }
      }

      //Get All Posts
      const res3 = await axios.get(
        `/api/get/posts/user/all?userID=${res.data.ref["@ref"].id}`
      );
      setPosts(res3.data.data);

      //Get All da Images
      const res4 = await axios.get(
        `/api/get/posts/user/byType?userID=${res.data.ref["@ref"].id}&type=media`
      );
      setImages(res4.data.data);
    };

    run();
  }, []);

  const follow = async () => {
    //Compile Payload
    const ourID = JSON.parse(localStorage.getItem("u_ref"));
    const payload = {
      target: userID,
      targetee: ourID["@ref"].id,
      toc: new Date(Date.now()).toISOString(),
      targeteeInfo: {
        name: ourUser.username,
        pfpic: ourUser.pfpic,
        server: ourUser.serverName,
      },
    };

    //According to our state, send request
    if (followState === 1) {
      setFollowState(2);
      document.getElementById("follow").play();

      //Add it to followers array
      const buf = [];
      for (let i = 0; i < followers.length; i++) {
        buf.push(followers[i]);
      }
      buf.push({ data: payload });
      setFollowers(buf);

      //API
      const res = await axios.post("/api/create/follow", payload);
      console.log(res);
    }

    if (followState === 2) {
      setFollowState(1);
      document.getElementById("unfollow").play();

      //Remove from Followers array
      const buf = [];
      for (let i = 0; i < followers.length; i++) {
        const element = followers[i];
        if (
          element.data.targeteeInfo.server === ourUser.serverName &&
          element.data.targeteeInfo.name === ourUser.username
        ) {
          //NOTHING BOI
        } else {
          buf.push(element);
        }
      }
      setFollowers(buf);
      const res = await axios.delete(
        `/api/delete/unfollow?target=${userID}&targetee=${ourID["@ref"].id}`
      );
      console.log(res);
    }

    console.log(payload);
  };

  const openFollowerModal = () => {
    setModalState(1);
  };

  const openImageModal = () => {
    setModalState(2);
    const payload = {
      url: images[0].data.image.url,
      dims: calculateDimentions(
        images[0].data.image.dimensions.height,
        images[0].data.image.dimensions.width,
        480,
        420
      ),
      index: 0,
      canLeft: false,
      canRight: images.length > 1 ? true : false,
    };
    console.log(payload);
    setModalImage(payload);
  };

  const openPostModal = () => {
    setModalState(3);
  };

  const scrollForward = () => {
    const targetIndex = modalImage.index + 1;
    const payload = {
      url: images[targetIndex].data.image.url,
      dims: calculateDimentions(
        images[targetIndex].data.image.dimensions.height,
        images[targetIndex].data.image.dimensions.width,
        480,
        420
      ),
      index: targetIndex,
      canLeft: true,
      canRight: images.length > targetIndex + 1 ? true : false,
    };

    console.log(payload);
    setModalImage(payload);
  };

  const scrollBackwards = () => {
    const targetIndex = modalImage.index - 1;
    const payload = {
      url: images[targetIndex].data.image.url,
      dims: calculateDimentions(
        images[targetIndex].data.image.dimensions.height,
        images[targetIndex].data.image.dimensions.width,
        480,
        420
      ),
      index: targetIndex,
      canLeft: targetIndex === 0 ? false : true,
      canRight: true,
    };

    console.log(payload);
    setModalImage(payload);
  };

  return (
    <>
      <div className="main">
        <Navbar />

        <div className="display side-content content">
          <img src={user.customization.banner} className="banner" />
          <img src={user.pfpic} className="pfpic" />

          <h1 className="username">
            <span>{user.username}</span>
            <button className="followButton" onClick={() => follow()}>
              {followState === 2 ? "Unfollow" : "Follow"}
            </button>

            {followState === 0 && (
              <a href="/o/settings">
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "300px",
                    cursor: "pointer",
                  }}
                >
                  <Image
                    src="/customize_PFEX.png"
                    height={25}
                    width={25}
                  ></Image>
                  <span style={{ fontSize: "0.5em" }}>
                    Customize how your profile looks
                  </span>
                </motion.div>
              </a>
            )}
          </h1>
          <p className="designation">
            {user.serverName} | {user.grade} | {user.section}
          </p>

          <p className="description">{user.customization.bio}</p>

          <div className="fields">
            <p className="toc field">
              <Image
                src="/calender_PFEX.png"
                height={20}
                width={20}
                className="fieldImage"
              />
              <span className="fieldTXT">
                <b>Joined</b> {moment(user.toc).fromNow()}
              </span>
            </p>
            {user.customization.favMovie !== "" && (
              <>
                <p className="toc field">
                  <Image
                    src="/movie_PFEX.png"
                    height={20}
                    width={20}
                    className="fieldImage"
                  />
                  <span className="fieldTXT">
                    <b>Fav Movie</b> : {user.customization.favMovie}
                  </span>
                </p>
              </>
            )}

            {user.customization.favSong !== "" && (
              <>
                <p className="toc field">
                  <Image
                    src="/song_PFEX.png"
                    height={20}
                    width={20}
                    className="fieldImage"
                  />
                  <span className="fieldTXT">
                    <b>Fav Song</b> : {user.customization.favSong}
                  </span>
                </p>
              </>
            )}

            {user.customization.favColor !== "" && (
              <>
                <p className="toc field">
                  <Image
                    src="/color_PFEX.png"
                    height={20}
                    width={20}
                    className="fieldImage"
                  />
                  <span className="fieldTXT">
                    <b>Fav Color</b> :{" "}
                    <span style={{ color: `${user.customization.favColor}` }}>
                      {user.customization.favColor}
                    </span>
                  </span>
                </p>
              </>
            )}
          </div>

          <div className="bigboi">
            <p className="followers" onClick={() => openFollowerModal()}>
              <Image src="/followers_PFEX.png" width={35} height={35}></Image>
              <span className="followText">{followers.length}</span>
              <span style={{ fontSize: "0.5em", marginTop: "10px" }}>
                follower{s(followers.length)}
              </span>
            </p>

            <p className="followers" onClick={() => openImageModal()}>
              <Image src="/pics_PFEX.png" width={35} height={35}></Image>
              <span className="followText">{images.length}</span>
              <span style={{ fontSize: "0.5em", marginTop: "10px" }}>
                pic{s(images.length)}
              </span>
            </p>

            <p className="followers" onClick={() => openPostModal()}>
              <Image src="/post_PFEX.png" width={35} height={35}></Image>
              <span className="followText">{posts.length}</span>
              <span style={{ fontSize: "0.5em", marginTop: "10px" }}>
                post{s(posts.length)}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="sfx">
        <audio id="follow" src="/follow.mp3" />
        <audio id="unfollow" src="/unfollow.wav" />
      </div>

      {modalState !== 0 && (
        <div className="zoomBlanket">
          <div className="zoomCurtain"></div>

          <p className="zoomX" onClick={() => setModalState(0)}>
            X
          </p>

          <div className="zoomContentWrapper">
            {modalState === 1 && (
              <div className="zoomContent">
                <h1 className="zoomHeading">followers</h1>
                <br />
                <br />
                {followers.map((e) => (
                  <>
                    <div className="zoomElement">
                      <a
                        href={`/${e.data.targeteeInfo.server}/${e.data.targeteeInfo.name}`}
                      >
                        <img
                          src={e.data.targeteeInfo.pfpic}
                          className="zoomImage"
                        />
                      </a>
                      <p
                        style={{
                          paddingLeft: "10px",
                          fontSize: "1.4em",
                          fontWeight: "600 ",
                        }}
                      >
                        {e.data.targeteeInfo.name}
                      </p>

                      <p style={{ paddingLeft: "50px" }}>
                        Since {moment(e.data.toc).format("DD/MM/YY ")}
                      </p>
                    </div>
                  </>
                ))}
              </div>
            )}

            {modalState === 2 && (
              <div className="zoomContent">
                <h1 className="zoomHeading">pictures</h1>
                <br />
                <br />
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <img
                    className="zoomImageDisplay"
                    src={modalImage.url}
                    style={{
                      width: `${modalImage.dims.width}px`,
                      height: `${modalImage.dims.height}px`,
                      marginTop: "14px",
                    }}
                  ></img>
                </div>

                <div className="zoomUnderContent">
                  {modalImage.canLeft ? (
                    <p
                      className="enabledArrow"
                      onClick={() => scrollBackwards()}
                    >
                      ←
                    </p>
                  ) : (
                    <p className="disabledArrow">←</p>
                  )}

                  <p style={{ fontSize: "1.5em" }}>{modalImage.index + 1}</p>

                  {modalImage.canRight ? (
                    <p className="enabledArrow" onClick={() => scrollForward()}>
                      →
                    </p>
                  ) : (
                    <p className="disabledArrow">→</p>
                  )}
                </div>
              </div>
            )}

            {modalState === 3 && (
              <div className="zoomContent">
                <h1 className="zoomHeading" style={{ marginLeft: "20px" }}>
                  posts
                </h1>
                <br />
                <br />
                {posts.map((e) => (
                  <a href={`/post/${e.ref["@ref"].id}`}>
                    <div className="zoomElement">
                      <img src={e.data.userInfo.pfpic} className="zoomImage" />
                      <p
                        style={{
                          paddingLeft: "10px",
                          width: "100px",
                          height: "20px",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "no-wrap",
                          fontWeight: 500,
                        }}
                      >
                        {e.data.text}
                        {e.data.text}
                        {e.data.text}
                      </p>
                      <p style={{ paddingLeft: "220px", position: "absolute" }}>
                        {e.data.type} post
                      </p>

                      <p style={{ paddingLeft: "340px", position: "absolute" }}>
                        {moment(e.data.toc).format("MM/DD/YY")}
                      </p>
                    </div>
                    <br />
                  </a>
                ))}
              </div>
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

          .display {
            display: flex;
            flex-direction: column;
          }

          .banner {
            width: 800px;
            height: 175px;
          }

          .pfpic {
            width: 90px;
            height: 90px;
            margin-top: -50px;
            margin-left: 5px;
            border: 2px solid white;
            border-radius: 50px;
            z-index: 2;
            cursor: pointer;
          }

          .username {
            margin-left: 5px;
            margin-top: 5px;
            margin-bottom: 0px;
            font-weight: 700;
            font-size: 1.5em;
            display: flex;
          }

          .designation {
            margin-left: 5px;
            margin-top: 0px;
            margin-bottom: 0px;
            color: grey;
          }

          .description {
            margin-top: 15px;
            margin-left: 5px;
          }

          .toc {
            margin-left: 5px;
            margin-top: 10px;
            font-size: 0.8em;
          }

          .field {
            display: flex;
            align-items: center;
            margin-top: 5px;
            margin-bottom: 0px;
          }

          .fieldTXT {
            margin-left: 3px;
          }

          .followButton {
            color: #fff;
            cursor: pointer;
            margin-left: 5px;
            margin-top: 3px;
            height: 30px;
            width: 100px;
            border: none;
            background-size: 300% 100%;
            font-weight: 400;
            font-size: 0.7em;
            font-family: var(--mainfont);
            background-image: linear-gradient(
              to right,
              ${followState === 1
                ? `
              #25aae1,
              #40e495,
              #30dd8a,
              #2bb673`
                : `${
                    followState === 0
                      ? `#5c5d5e, #464747, #242526`
                      : "#eee, #333"
                  }              
                `}
            );
            box-shadow: ${followState === 1
              ? `0 4px 15px 0 rgba(49, 196, 190, 0.75)`
              : `0 4px 15px 0 rgba(155, 160, 168, 0.75)`};

            border-radius: 50px;
            moz-transition: all 0.4s ease-in-out;
            -o-transition: all 0.4s ease-in-out;
            -webkit-transition: all 0.4s ease-in-out;
            transition: all 0.4s ease-in-out;
          }

          .followButton:hover {
            ${followState !== 0
              ? `            background-position: 100% 0;
            transform: scale(1.05);
            moz-transition: all 0.4s ease-in-out;
            -o-transition: all 0.4s ease-in-out;
            -webkit-transition: all 0.4s ease-in-out;
            transition: all 0.4s ease-in-out;`
              : ``}
          }

          .bigboi {
            display: flex;
            justify-content: space-evenly;
          }

          .followers {
            display: flex;
            align-items: center;
            font-size: 2em;
            margin-left: 5px;
            cursor: pointer;
            transition: all 500ms ease;
          }

          .followers:hover {
            color: #8c0900;
          }

          .followText {
            margin-left: 5px;
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

          .zoomContent {
            z-index: 105;
            color: black;
            background-color: white;
            width: 450px;
            height: 500px;
            margin-left: 400px;
            margin-top: 50px;
            border-radius: 50px;
            padding-left: 20px;
            padding-right: 20px;
          }

          .zoomContentWrapper {
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

          .zoomHeading {
            text-align: center;
            padding-left: 150px;
            margin-top: 4px;
            position: fixed;
          }

          .zoomElement {
            z-index: 200;
            margin-top: -10px;
            display: flex;
            align-items: center;
          }

          .zoomImage {
            height: 45px;
            width: 45px;
            margin-top: 0px;
            border-radius: 50%;
          }

          .zoomUnderContent {
            display: flex;
            justify-content: space-evenly;
            align-items: center;
            margin-top: -10px;
          }

          .enabledArrow {
            font-size: 2em;
            color: black;
            cursor: pointer;
          }

          .disabledArrow {
            font-size: 2em;
            color: grey;
            cursor: not-allowed;
          }
        `}
      </style>
    </>
  );
}
