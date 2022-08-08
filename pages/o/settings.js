import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";

export default function Settings() {
  const [ourUser, setOurUser] = useState({ customization: {} });
  const [ourRef, setOurRef] = useState();
  const [pfpic, setPfpic] = useState();
  const [banner, setBanner] = useState();

  //Edit States
  const [editBio, setEditBio] = useState(false);
  const [editFavMovie, setEditFavMovie] = useState(false);
  const [editFavSong, setEditFavSong] = useState(false);
  const [editFavColor, setEditFavColor] = useState(false);

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

  const updateTextField = async (nest, field, value, setFunctionBool) => {
    //Call Edit Nested
    await editNested(nest, field, value, function (d) {
      console.log(d);
    });

    //Update UI
    setFunctionBool(false);
  };

  return (
    <>
      <div className="main">
        <Navbar />

        <div className="display side-content content">
          <a href={`/${ourUser.serverName}/${ourUser.username}`}>
            <button className="profileButton button">Back to Profile </button>
          </a>
          <h1 className="heading">Settings</h1>

          <h2>Essentials</h2>
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
            <div className="category-text">
              {editBio === false ? (
                <>
                  <span className="cat-act-text">
                    {ourUser.customization.bio}
                  </span>
                  <img
                    src={"/edit_RFEX.png"}
                    width={30}
                    height={30}
                    className="cat-edit-img-txt"
                    onClick={() => setEditBio(true)}
                  />
                </>
              ) : (
                <div>
                  <input
                    className="cat-act-text cat-act-input"
                    defaultValue={ourUser.customization.bio}
                    id="pasta"
                  />

                  <img
                    src={"/check_RFEX.png"}
                    width={30}
                    height={30}
                    className="cat-edit-img-txt editBut"
                    onClick={() =>
                      updateTextField(
                        "customization",
                        "bio",
                        document.getElementById("pasta").value,
                        setEditBio
                      )
                    }
                  />

                  <img
                    src={"/cross_RFEX.png"}
                    width={30}
                    height={30}
                    className="cat-edit-img-txt editBut"
                    onClick={() => setEditBio(false)}
                  />
                </div>
              )}
            </div>
          </div>

          <h2>Favorites</h2>
          {/* Favorite Movie */}
          <div className="category">
            <p className="cat-head">Favorite Movie</p>
            <div className="category-text">
              {editFavMovie === false ? (
                <>
                  <span className="cat-act-text">
                    {ourUser.customization.favMovie === "" ? (
                      <i>not assigned</i>
                    ) : (
                      <span>{ourUser.customization.favMovie}</span>
                    )}
                  </span>
                  <img
                    src={"/edit_RFEX.png"}
                    width={30}
                    height={30}
                    className="cat-edit-img-txt"
                    onClick={() => setEditFavMovie(true)}
                  />
                </>
              ) : (
                <div>
                  <input
                    className="cat-act-text cat-act-input"
                    defaultValue={ourUser.customization.favMovie}
                    id="pasta1"
                  />

                  <img
                    src={"/check_RFEX.png"}
                    width={30}
                    height={30}
                    className="cat-edit-img-txt editBut"
                    onClick={() =>
                      updateTextField(
                        "customization",
                        "favMovie",
                        document.getElementById("pasta1").value,
                        setEditFavMovie
                      )
                    }
                  />

                  <img
                    src={"/cross_RFEX.png"}
                    width={30}
                    height={30}
                    className="cat-edit-img-txt editBut"
                    onClick={() => setEditFavMovie(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Favorite Song */}
          <div className="category">
            <p className="cat-head">Favorite Song</p>
            <div className="category-text">
              {editFavSong === false ? (
                <>
                  <span className="cat-act-text">
                    {ourUser.customization.favSong === "" ? (
                      <i>not assigned</i>
                    ) : (
                      <span>{ourUser.customization.favSong}</span>
                    )}
                  </span>
                  <img
                    src={"/edit_RFEX.png"}
                    width={30}
                    height={30}
                    className="cat-edit-img-txt"
                    onClick={() => setEditFavSong(true)}
                  />
                </>
              ) : (
                <div>
                  <input
                    className="cat-act-text cat-act-input"
                    defaultValue={ourUser.customization.favSong}
                    id="pasta3"
                  />

                  <img
                    src={"/check_RFEX.png"}
                    width={30}
                    height={30}
                    className="cat-edit-img-txt editBut"
                    onClick={() =>
                      updateTextField(
                        "customization",
                        "favSong",
                        document.getElementById("pasta3").value,
                        setEditFavSong
                      )
                    }
                  />

                  <img
                    src={"/cross_RFEX.png"}
                    width={30}
                    height={30}
                    className="cat-edit-img-txt editBut"
                    onClick={() => setEditFavMovie(false)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Favorite Color */}
          <div className="category">
            <p className="cat-head">Favorite Color</p>
            <div className="category-text">
              {editFavColor === false ? (
                <>
                  <span className="cat-act-text">
                    {ourUser.customization.favColor === "" ? (
                      <i>not assigned</i>
                    ) : (
                      <span>{ourUser.customization.favColor}</span>
                    )}
                  </span>
                  <img
                    src={"/edit_RFEX.png"}
                    width={30}
                    height={30}
                    className="cat-edit-img-txt"
                    onClick={() => setEditFavColor(true)}
                  />
                </>
              ) : (
                <div>
                  <input
                    className="cat-act-text cat-act-input"
                    defaultValue={ourUser.customization.favColor}
                    id="pasta2"
                  />

                  <img
                    src={"/check_RFEX.png"}
                    width={30}
                    height={30}
                    className="cat-edit-img-txt editBut"
                    onClick={() =>
                      updateTextField(
                        "customization",
                        "favColor",
                        document.getElementById("pasta2").value,
                        setEditFavColor
                      )
                    }
                  />

                  <img
                    src={"/cross_RFEX.png"}
                    width={30}
                    height={30}
                    className="cat-edit-img-txt editBut"
                    onClick={() => setEditFavColor(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>
        {`
          .profileButton {
            position: fixed;
            margin-left: 600px;
          }

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

          .category-text {
            margin-top: -10px;
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

          .cat-edit-img-txt {
            margin-top: -10px;
            margin-left: 400px;
          }

          .cat-banner {
            width: 800px;
            height: 175px;
          }

          .cat-act-text {
            font-weight: 600;
            font-size: 1.1em;
            margin-top: 0px;
          }

          .cat-act-input {
            outline: none;
            border: none;
            background-color: none;
            background: none;
            border-bottom: 2px solid grey;
            font-weight: 500;
            width: 600px;
            margin-right: 50px;
          }

          .editBut {
            margin-left: 10px;
            scale: 0.9;
            cursor: pointer;
            transition: all 100ms ease;
          }

          .editBut:hover {
            scale: 1.1;
          }
        `}
      </style>
    </>
  );
}
