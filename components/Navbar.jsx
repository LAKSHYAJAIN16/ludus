import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import axios from "axios";
import calculateDimentions from "../lib/calculateDimentions";

export default function Navbar() {
  //User
  const [user, setUser] = useState({
    username: "no-user",
    serverName: "error",
  });

  //Modal State
  const [showModal, setShowModal] = useState(false);

  //Text in Share Input
  const [text, setText] = useState("");

  //The State of our message we're typing
  const [messageState, setMessageState] = useState("text");

  //Media Files
  const [mediaFile, setMediaFile] = useState(null);

  //UI Glitch state
  const [over, setOver] = useState(false);

  useEffect(() => {
    try {
      const us = JSON.parse(localStorage.getItem("u_u") || "");
      setUser(us);
    } catch (err) {}
  }, []);

  //Method to Open Modal
  const shareModal = () => {
    setShowModal(true);
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    window.history.pushState("", "Writing Something", "/o/home?open-modal=1");
  };

  //Close Modal
  const closeModal = () => {
    setShowModal(false);
    setMessageState("text");
    setMediaFile(null);
    window.history.pushState("", "Home Page | ludus", "/o/home");
    document.body.style.overflow = "visible";
  };

  //Publish Post
  const share = async () => {
    //Get Ref from Localstorage
    const ref = JSON.parse(localStorage.getItem("u_ref"));

    //Compile Data according to state
    let data = {};
    if (messageState === "text") {
      data = {
        text: text,
        userID: ref["@ref"]["id"],
        userInfo: {
          name: user.username,
          pfpic: user.pfpic,
          server : user.serverName
        },
        tags: [],
        type: "text",
        toc: new Date(Date.now()).toISOString(),
      };
    }
    if (messageState === "media") {
      data = {
        text: text,
        userID: ref["@ref"]["id"],
        userInfo: {
          name: user.username,
          pfpic: user.pfpic,
          server : user.serverName
        },
        tags: [],
        type: "media",
        toc: new Date(Date.now()).toISOString(),
        image: {
          dimensions: {
            width: mediaFile.width,
            height: mediaFile.height,
          },
          url: mediaFile.file,
        },
      };
    }
    if (messageState === "gif") {
      data = {
        text: text,
        userID: ref["@ref"]["id"],
        userInfo: {
          name: user.username,
          pfpic: user.pfpic,
          server : user.serverName
        },
        tags: [],
        type: "gif",
        toc: new Date(Date.now()).toISOString(),
        gif: {
          dimensions: {
            width: mediaFile.width,
            height: mediaFile.height,
          },
          url: mediaFile.file,
        },
      };
    }

    //Send dat request
    const res = await axios.post("/api/create/post", data);
    console.log(res);

    //Close Modal
    setShowModal(false);

    //Reset states
    setMediaFile(null);
    setMessageState("text");
    window.history.pushState("", "Home Page | ludus", "/o/home");
    document.body.style.overflow = "visible";
  };

  //Add Media
  const addMedia = async () => {
    //Create Input Element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jpg,.jpeg,.png,.ico";
    input.onchange = async (e) => {
      //Get File (call it video for some internal reason)
      const video = input.files[0];

      //Upload to Cloudinary
      if (video != null) {
        //Define Data
        const formData = new FormData();
        formData.append("file", video);
        formData.append("upload_preset", "cdkq7wce");

        //Get Response
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/everything-limited/auto/upload",
          formData
        );

        //Calculate Dimentions for current use
        const dims = calculateDimentions(
          res.data.height,
          res.data.width,
          300,
          200
        );

        //Add it to state
        const mediaFileTemp = {
          file: res.data.url,
          height: res.data.height,
          width: res.data.width,
          tH: dims.height,
          tW: dims.width,
        };
        console.log(mediaFileTemp);
        setMediaFile(mediaFileTemp);

        //Change state to media
        setMessageState("media");
      }

      //Remove from dom
      input.remove();
    };
    input.click();
  };

  //Add Gif
  const addGif = async () => {
    //Create Input Element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".gif";
    input.onchange = async (e) => {
      //Get File (call it video for some internal reason)
      const video = input.files[0];

      //Upload to Cloudinary
      if (video != null) {
        //Define Data
        const formData = new FormData();
        formData.append("file", video);
        formData.append("upload_preset", "cdkq7wce");

        //Get Response
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/everything-limited/auto/upload",
          formData
        );

        //Calculate Dimentions for current use
        const dims = calculateDimentions(
          res.data.height,
          res.data.width,
          300,
          200
        );

        //Add it to state
        const mediaFileTemp = {
          file: res.data.url,
          height: res.data.height,
          width: res.data.width,
          tH: dims.height,
          tW: dims.width,
        };
        console.log(mediaFileTemp);
        setMediaFile(mediaFileTemp);

        //Change state to gif
        setMessageState("gif");
      }

      //Remove from dom
      input.remove();
    };
    input.click();
  };
  
  return (
    <>
      <div className="main2">
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              animate={{ backgroundColor: "rgba(0,0,0,0.4)" }}
              transition={{ duration: 0.5 }}
              style={{
                position: "absolute",
                zIndex: 3,
                width: "100vw",
                minHeight: "100% !important",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0)",
              }}
            ></motion.div>

            {/* Main Modal */}
            <motion.div
              animate={{ opacity: 1, scale: 2 }}
              transition={{ duration: 0.3 }}
              className="side-content"
              style={{
                opacity: 0,
                scale: 1.8,
                zIndex: 4,
                marginTop: mediaFile ? "60%" : "60px",
                position: "absolute",
                marginLeft: "40vw",
                width: "300px",
                backgroundColor: "white",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                overflow: "none !important",
              }}
            >
              {/* X */}
              <motion.div
                className="x"
                whileHover={{ fontWeight: 800 }}
                style={{
                  cursor: "pointer",
                  marginLeft: "10px",
                  marginTop: "5px",
                  fontSize: "0.7em",
                  fontWeight: 400,
                }}
                onClick={() => closeModal()}
              >
                X
              </motion.div>

              {/* Main Input Field */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={user["pfpic"]}
                  style={{
                    height: "25px",
                    width: "25px",
                    borderRadius: "25px",
                    marginTop: "10px",
                    marginLeft: "7px",
                    marginBottom: "20px",
                  }}
                />

                <input
                  placeholder="How's Life?"
                  className="whatsgood"
                  onChange={(e) => setText(e.target.value)}
                ></input>
              </div>

              {/* Media documents attached  */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignContent: "center",
                  flexDirection: "column",
                }}
              >
                {mediaFile && (
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "right",
                        marginRight: "20px",
                        fontSize: "0.6em",
                        cursor: "pointer",
                      }}
                      onClick={function () {
                        setMediaFile(null);
                        setMessageState("text");
                      }}
                    >
                      X
                    </div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <img
                        src={mediaFile.file}
                        width={mediaFile.tW}
                        height={mediaFile.tH}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Addons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: mediaFile ? "20px" : "-20px",
                }}
              >
                <div className="addon" onClick={() => addMedia()}>
                  <Image src="/media_M.png" height={16} width={16} />
                </div>

                <div className="addon" onClick={() => addGif()}>
                  <Image src="/gif_M.png" height={16} width={16} />
                </div>

                {/* <div className="addon">
                  <Image src="/emoji_1M.png" height={16} width={16} />
                </div>
 
                <div className="addon">
                  <Image src="/tag_M.png" height={16} width={16} />
                </div> */}
              </div>

              {/* Post Button */}
              <button className="buttonModal" onClick={() => share()}>
                Share
              </button>
            </motion.div>
          </>
        )}

        <div className="ui" style={{ position: "fixed" }}>
          <a href="/o/home">
            <p
              className="logoText"
              onMouseEnter={() => setOver(true)}
              onMouseLeave={() => setOver(false)}
            >
              {over === true ? (
                <>
                  <span ariaHidden="true" className="spanAnim">
                    ludus
                  </span>
                  <span>ludus</span>
                  <span ariaHidden="true" className="spanAnim">
                    ludus
                  </span>
                </>
              ) : (
                <span>ludus</span>
              )}
            </p>
          </a>

          <a className="item" href="/o/home">
            <Image src="/house_S.png" width={30} height={30} />
            <p style={{ marginLeft: "4px" }}>home</p>
          </a>

          <a className="item" href="/o/trending">
            <Image src="/trending_S.png" width={30} height={30} />
            <p style={{ marginLeft: "3px" }}>trending</p>
          </a>

          <a className="item" href="/o/class-feed">
            <Image src="/class_S.png" width={30} height={30} />
            <p style={{ marginLeft: "4px" }}>class feed</p>
          </a>

          <a className="item" href="/o/direct-msgs">
            <Image src="/message_S.png" width={30} height={30} />
            <p style={{ marginLeft: "4px" }}>direct messages</p>
          </a>

          <a className="item" href={`/${user.serverName}/${user.username}`}>
            <Image src="/profile_S.png" width={30} height={30} />
            <p style={{ marginLeft: "4px" }}>profile</p>
          </a>

          <button className="button" onClick={() => shareModal()}>
            Share
          </button>
        </div>
      </div>

      <style jsx>
        {`
          .main2 {
            position: absolute;
            minheight: 100% !important;
            height: 100%;
          }

          .logoText {
            font-family: var(--mainfont);
            font-size: 2.5em;
            margin-left: 40px;
            margin-top: 30px;
            cursor: pointer;
            transition: all 500ms ease;
            position: relative;
            ${over === false
              ? `text-shadow: -0.04em -0.020em 0 #00fffc, 0.020em 0.028em 0 #fc00ff,
              -0.04em -0.04em 0 #fffc00;`
              : `text-shadow: 0.02em 0 0 #00fffc, -0.03em -0.04em 0 #fc00ff,
              0.025em 0.04em 0 #fffc00;`}
            ${over === false
              ? "animation: none;"
              : "animation: glitch 1450ms infinite;"}
          }

          .logoText .spanAnim {
            position: absolute;
            top: 0;
            left: 0;
          }

          .logoText .spanAnim:first-child {
            animation: glitch 1000ms infinite;
            clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
            transform: translate(-0.04em, -0.03em);
            opacity: 0.75;
          }

          .logoText .spanAnim:last-child {
            animation: glitch 620ms infinite;
            clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
            transform: translate(0.04em, 0.03em);
            opacity: 0.75;
          }

          .item {
            display: flex;
            align-items: center;
            margin-left: 30px;
            margin-bottom: -10px;
            font-size: 1.5em;
            cursor: pointer;
            color: darkgrey;
            transition: all 500ms ease;
          }

          .item:hover {
            color: black;
          }

          .button {
            color: #fff;
            cursor: pointer;
            margin: 23px;
            height: 55px;
            width: 200px;
            border: none;
            background-size: 300% 100%;
            font-weight: 400;
            font-size: 1.3em;
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

          .button:hover {
            background-position: 100% 0;
            transform: scale(1.05);
            moz-transition: all 0.4s ease-in-out;
            -o-transition: all 0.4s ease-in-out;
            -webkit-transition: all 0.4s ease-in-out;
            transition: all 0.4s ease-in-out;
          }

          .buttonModal {
            margin-left: 220px;
            margin-bottom: 5px;
            color: #fff;
            cursor: pointer;
            height: 16.75px;
            width: 55px;
            border: none;
            background-size: 300% 100%;
            font-weight: 400;
            font-size: 0.6em;
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

          .buttonModal:hover {
            background-position: 100% 0;
            transform: scale(1.05);
            moz-transition: all 0.4s ease-in-out;
            -o-transition: all 0.4s ease-in-out;
            -webkit-transition: all 0.4s ease-in-out;
            transition: all 0.4s ease-in-out;
          }

          .whatsgood {
            border: none;
            font-size: 0.6em;
            margin-top: -10px;
            margin-left: 4px;
            font-weight: 300;
            width: 300px;
          }

          .whatsgood:focus {
            border: none;
            outline: none;
          }

          .addon {
            margin-right: 10px;
            cursor: pointer;
          }

          @keyframes glitch {
            0% {
              text-shadow: 0.05em 0 0 #00fffc, -0.03em -0.04em 0 #fc00ff,
                0.025em 0.04em 0 #fffc00;
            }
            15% {
              text-shadow: 0.05em 0 0 #00fffc, -0.03em -0.04em 0 #fc00ff,
                0.025em 0.04em 0 #fffc00;
            }
            16% {
              text-shadow: -0.05em -0.025em 0 #00fffc, 0.025em 0.035em 0 #fc00ff,
                -0.05em -0.05em 0 #fffc00;
            }
            49% {
              text-shadow: -0.05em -0.025em 0 #00fffc, 0.025em 0.035em 0 #fc00ff,
                -0.05em -0.05em 0 #fffc00;
            }
            50% {
              text-shadow: 0.05em 0.035em 0 #00fffc, 0.03em 0 0 #fc00ff,
                0 -0.04em 0 #fffc00;
            }
            99% {
              text-shadow: 0.05em 0.035em 0 #00fffc, 0.03em 0 0 #fc00ff,
                0 -0.04em 0 #fffc00;
            }
            100% {
              text-shadow: -0.05em 0 0 #00fffc, -0.025em -0.04em 0 #fc00ff,
                -0.04em -0.025em 0 #fffc00;
            }
          }
        `}
      </style>
    </>
  );
}
