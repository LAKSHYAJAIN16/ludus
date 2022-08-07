import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";

export default function Settings() {
  const [ourUser, setOurUser] = useState({ customization: {} });
  const [ourRef, setOurRef] = useState();
  const [pfpic, setPfpic] = useState();
  const [banner, setBanner] = useState();

  useEffect(() => {
    const te_user = JSON.parse(localStorage.getItem("u_u"));
    const te_ref = JSON.parse(localStorage.getItem("u_ref"));
    setOurUser(te_user);
    setOurRef(te_ref["@ref"].id);
    setPfpic(te_user.pfpic);
    setBanner(te_user.customization.banner);
  }, []);

  const edit = async (field, value, callback) => {
    //API
    const doc = await axios.get(
      `/api/update/user-setting?f=${field}&v=${value}&u=${ourRef}`
    );
    callback(doc);

    //Update it in local memory
    const new_our = ourUser;
    ourUser[field] = value;
    setOurUser(ourUser);
    localStorage.setItem("u_u", JSON.stringify(new_our));
  };

  const editNested = async (nest, field, value, callback) => {
    //API
    const doc = await axios.get(
      `/api/update/user-nested-setting?f=${field}&v=${value}&u=${ourRef}&n=${nest}`
    );
    callback(doc);

    //Update it in local memory
    const new_our = ourUser;
    ourUser[nest][field] = value;
    setOurUser(ourUser);
    localStorage.setItem("u_u", JSON.stringify(new_our));
  };

  const updateProfilePic = async (file) => {
    console.log("got it!");
    if (file !== null) {
      //Assemble formdata
      console.log("hehe");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "cdkq7wce");

      //Get the cloudinary url
      setPfpic("/loading_RFEX.gif");
      const res1 = await axios.post(
        "https://api.cloudinary.com/v1_1/everything-limited/auto/upload",
        formData
      );
      console.log(res1);
      const userPFPIC = res1.data.url;
      setPfpic(userPFPIC);

      //Update it in fauna
      edit("pfpic", userPFPIC, function (doc) {
        console.log(doc);
      });
    }
  };

  const updateBanner = async (file) => {
    console.log("got it!");
    if (file !== null) {
      //Assemble formdata
      console.log("hehe1");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "cdkq7wce");

      //Get the cloudinary url
      setBanner(
        "https://www.solidbackgrounds.com/images/2560x1440/2560x1440-davys-grey-solid-color-background.jpg"
      );
      const res1 = await axios.post(
        "https://api.cloudinary.com/v1_1/everything-limited/auto/upload",
        formData
      );
      console.log(res1);
      const userBanner = res1.data.url;
      setBanner(userBanner);

      //Update it in fauna
      editNested("customization", "banner", userBanner, function (doc) {
        console.log(doc);
      });
    }
  };

  return (
    <>
      <div className="main">
        <Navbar />

        <div className="display side-content content">
          <h1 className="heading">Settings</h1>

          {/* Profile Picture */}
          <div className="category">
            <p className="cat-head">Profile Picture</p>
            <div style={{ marginTop: "-10px" }}>
              <div style={{ marginLeft: "130px" }}>
                <input
                  type="file"
                  id="hehe"
                  className="cat-pic-edit"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={(e) => updateProfilePic(e.target.files[0])}
                />
                <label htmlFor="hehe">
                  <Image
                    src={"/edit_RFEX.png"}
                    width={30}
                    height={30}
                    className="cat-edit-img"
                  />
                </label>
              </div>
              <img src={pfpic} className="cat-pic" />
            </div>
          </div>

          {/* Banner */}
          <div className="category">
            <p className="cat-head">Banner</p>
            <div style={{ marginTop: "-40px" }}>
              <div style={{ marginLeft: "800px" }}>
                <input
                  type="file"
                  id="hehe2"
                  className="cat-pic-edit"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={(e) => updateBanner(e.target.files[0])}
                />
                <label htmlFor="hehe2">
                  <Image
                    src={"/edit_RFEX.png"}
                    width={30}
                    height={30}
                    className="cat-edit-img"
                  />
                </label>
              </div>
              <img src={banner} className="cat-banner" />
            </div>
          </div>

          {/* Bio */}
          <div className="category">
            <p className="cat-head">Bio</p>
            <p className="cat-act-text">Just a guy lol</p>
            <Image
              src={"/edit_RFEX.png"}
              width={30}
              height={30}
              className="cat-edit-img"
            />
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

          .category {
            margin-bottom: 40px;
          }

          .cat-head {
            font-weight: 300;
            font-size: 1.2em;
          }

          .cat-pic {
            margin-top: -30px;
            margin-left: 0px;
            border-radius: 50%;
            width: 140px;
            height: 140px;
          }

          .cat-pic-edit {
            display: none;
            cursor: pointer;
          }

          .cat-edit-img {
            cursor: pointer;
          }

          .cat-banner {
            width: 800px;
            height: 175px;
          }

          .cat-act-text {
            font-weight: 600;
            font-size: 1.1em;
            margin-top: -10px;
          }
        `}
      </style>
    </>
  );
}
