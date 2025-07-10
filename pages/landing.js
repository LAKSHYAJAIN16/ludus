import React, { useState } from "react";
import axios from "axios";

export default function Landing() {
  const [glitchActive, setGlitchActive] = useState(false);

  const validateEmail = async (e) => {
    e.preventDefault();
    setGlitchActive(true)
    const form = new FormData(e.target);
    const formData = Object.fromEntries(form.entries());
    const email = formData.email;

    try {
      const res = await axios.post("/api/misc/validateEmail", { email });
      const data = res.data;
      console.log(data);

      if (data.isValid === true) {
        window.location.replace(
          `/signup?e=${email}&sName=${data.serverName}&sI=${data.serverID}&domain=${data.domain}`
        );
      } else {
        alert(
          "Looks like that domain isn't part of our platform. Contact us to get your school added!"
        );
      }
    } catch (error) {
      console.error("Email validation failed:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <>
      <div className="main flex-col">
        <p
          className={`logoText ${glitchActive ? "glitch" : ""}`}
          onMouseEnter={() => setGlitchActive(true)}
          onMouseLeave={() => setGlitchActive(false)}
        >
          {glitchActive ? (
            <>
              <span aria-hidden="true" className="spanAnim">
                ludus
              </span>
              <span>ludus</span>
              <span aria-hidden="true" className="spanAnim">
                ludus
              </span>
            </>
          ) : (
            <span>ludus</span>
          )}
        </p>

        <form
          onSubmit={validateEmail}
          className="formContainer"
          onMouseEnter={() => setGlitchActive(true)}
          onMouseLeave={() => setGlitchActive(false)}
        >
          <p className="introToInput">Enter your school email.</p>
          <input
            className="input"
            name="email"
            placeholder="yourname@school.edu"
            type="email"
            required
          />
          <button className="button">Continue</button>
        </form>
      </div>

      <style jsx>{`
        .main {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          min-height: 100vh;
          overflow-x: hidden;
          background: #f5f5f5;
          text-align: center;
        }

        .logoText {
          font-family: var(--mainfont);
          font-size: 9em;
          margin-top: 10px;
          margin-bottom: 20px;
          cursor: pointer;
          position: relative;
          line-height: 1;
          transition: all 0.5s ease;
          text-shadow: -0.04em -0.020em 0 #00fffc,
            0.020em 0.028em 0 #fc00ff, -0.04em -0.04em 0 #fffc00;
        }

        .glitch {
          text-shadow: 0.02em 0 0 #00fffc, -0.03em -0.04em 0 #fc00ff,
            0.025em 0.04em 0 #fffc00;
          animation: glitch 4450ms infinite;
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

        .formContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          gap: 10px;
        }

        .introToInput {
          font-size: 1.2em;
          margin-bottom: 5px;
        }

        .input {
          width: 300px;
          padding: 12px 20px;
          border: 2px solid #ccc;
          border-radius: 25px;
          font-size: 1em;
          transition: 0.3s;
          outline: none;
        }

        .input:focus {
          border-color: #30dd8a;
          box-shadow: 0 0 5px rgba(48, 221, 138, 0.5);
        }

        .button {
          margin-top: 10px;
          color: #fff;
          cursor: pointer;
          height: 50px;
          width: 200px;
          border: none;
          font-size: 1.2em;
          font-family: var(--mainfont);
          border-radius: 50px;
          background-image: linear-gradient(
            to right,
            #25aae1,
            #40e495,
            #30dd8a,
            #2bb673
          );
          background-size: 300% 100%;
          box-shadow: 0 4px 15px 0 rgba(49, 196, 190, 0.75);
          transition: all 0.4s ease-in-out;
        }

        .button:hover {
          background-position: 100% 0;
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .logoText {
            font-size: 4.5em;
          }

          .input {
            width: 80%;
          }

          .button {
            width: 70%;
          }
        }

        @keyframes glitch {
          0%,
          15% {
            text-shadow: 0.05em 0 0 #00fffc, -0.03em -0.04em 0 #fc00ff,
              0.025em 0.04em 0 #fffc00;
          }
          16%,
          49% {
            text-shadow: -0.05em -0.025em 0 #00fffc,
              0.025em 0.035em 0 #fc00ff, -0.05em -0.05em 0 #fffc00;
          }
          50%,
          99% {
            text-shadow: 0.05em 0.035em 0 #00fffc, 0.03em 0 0 #fc00ff,
              0 -0.04em 0 #fffc00;
          }
          100% {
            text-shadow: -0.05em 0 0 #00fffc, -0.025em -0.04em 0 #fc00ff,
              -0.04em -0.025em 0 #fffc00;
          }
        }
      `}</style>
    </>
  );
}
