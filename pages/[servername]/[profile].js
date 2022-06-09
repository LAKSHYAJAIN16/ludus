import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import Image from "next/image";

import s from "../../lib/s";
import Navbar from "../../components/Navbar";

export default function Profile() {
  const [user, setUser] = useState({
    customization: { banner: "", bio: "A Proud ludus user" },
  });
  const [userID, setUserID] = useState();
  const [ourUser, setOurUser] = useState({});

  //1 = Can Follow, 2 = Already Followed, 0 = Same User
  const [followState, setFollowState] = useState(0);

  //Total Followers
  const [totalFollowers, setTotalFollowers] = useState(0);

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
      setTotalFollowers(res2.data.data.length);

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
      setTotalFollowers(totalFollowers + 1);
      document.getElementById("follow").play();
      const res = await axios.post("/api/create/follow", payload);
      console.log(res);
    }

    if (followState === 2) {
      setFollowState(1);
      setTotalFollowers(totalFollowers - 1);
      document.getElementById("unfollow").play();
      const res = await axios.delete(
        `/api/delete/unfollow?target=${userID}&targetee=${ourID["@ref"].id}`
      );
      console.log(res);
    }

    console.log(payload);
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
            <p className="followers">
              <Image src="/followers_PFEX.png" width={35} height={35}></Image>
              <span className="followText">{totalFollowers}</span>
              <span style={{ fontSize: "0.5em", marginTop: "10px" }}>
                follower{s(totalFollowers)}
              </span>
            </p>

            <p className="followers">
              <Image src="/pics_PFEX.png" width={35} height={35}></Image>
              <span className="followText">18</span>
              <span style={{ fontSize: "0.5em", marginTop: "10px" }}>pics</span>
            </p>

            <p className="followers">
              <Image src="/post_PFEX.png" width={35} height={35}></Image>
              <span className="followText">28</span>
              <span style={{ fontSize: "0.5em", marginTop: "10px" }}>
                posts
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="sfx">
        <audio id="follow" src="/follow.mp3"/>
        <audio id="unfollow" src="/unfollow.wav"/>
      </div>

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
          }

          .followText {
            margin-left: 5px;
          }
        `}
      </style>
    </>
  );
}
