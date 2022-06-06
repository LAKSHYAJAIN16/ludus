import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <>
      <div className="main">
        <Navbar />
      </div>
      <style jsx>
        {`
          .main {
            margin-top : 0px;
            background-color: var(--palette-main);
            min-height: 100vh;
          }
        `}
      </style>
    </>
  );
}
