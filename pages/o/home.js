import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

import Navbar from "../../components/Navbar";
import HomePost from "../../components/HomePost";

export default function Home() {
  //User
  const [user, setUser] = useState({});

  //Media Files
  const [mediaFile, setMediaFile] = useState(null);

  //Feed
  const [feed, setFeed] = useState([]);

  //If we're enlarging
  const [enlargeImage, setEnlargeImage] = useState();
  const [showEnlarge, setShowEnlarge] = useState(false);
  const [iID, setIID] = useState("");

  useEffect(() => {
    const run = async () => {
      //Get User
      const us = JSON.parse(localStorage.getItem("u_u") || "");
      setUser(us);

      //Get Ref
      const ref = JSON.parse(localStorage.getItem("u_ref") || "");
      const id = ref["@ref"]["id"];

      //Send Request to API
      const res = await axios.get(`/api/get/feed?uID=${id}`);

      //Set Feed
      const temp_feed = res.data.data;
      setFeed(temp_feed);
    };

    run();
  }, []);

  const zoomCallback = (id, post) => {
    // Code
  };

  return (
    <>
      <div className="main">
        <Navbar />
        <div className="side-content content">
          <h1 className="heading">Home</h1>
          <>
            {feed.map((e) => (
              <>
                <HomePost post={e} user={user} zoomCallback={zoomCallback} />
              </>
            ))}
          </>
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

          .enlarged {
            position: absolute;
            left: 50%;
            top: 50%;
            -webkit-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
          }
        `}
      </style>
    </>
  );
}
