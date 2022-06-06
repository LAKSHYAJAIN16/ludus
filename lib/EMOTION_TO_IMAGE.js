const EMOTION_TO_IMAGE = {
  heartEyes: "/he_REA.png",
  rofl: "/rofl_REA.png",
  kiss: "/k_REA.png",
  cool: "/cool_REA.png",
  shocked: "/sh_REA.png",
  smile: "/emoji_MARKER.png",
  confused: "/conf_REA.png",
  party: "/party_REA.png",
  dab: "/dab_REA.png",
  cry: "/cry_REA.png",
  star: "/star_REA.png",
  rShock: "/rShock_REA.png",
};

export function isNotReg(emotion) {
  if (emotion === "fire" || emotion === "heart" || emotion === "like") {
    return false;
  }
  return true;
}

export default EMOTION_TO_IMAGE;
