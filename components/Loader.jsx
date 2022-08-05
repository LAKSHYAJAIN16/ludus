import React from "react";

export default function Loader({ size }) {
  return (
    <div
      className="loader"
      style={{ width: `${30 * size}px`, height: `${30 * size}px` }}
    />
  );
}
