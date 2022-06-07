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
  fire : "/f_REA.png",
  like : "/l_REA.png",
  heart : "/h_REA.png"
};

export function isNotReg(emotion) {
  if (emotion === "fire" || emotion === "heart" || emotion === "like") {
    return false;
  }

  return true;
}

export function calculateEmoticonCount(emotion, reactions) {
  if(reactions === undefined) return 0;
  let count = 0;
  for (let i = 0; i < reactions.length; i++) {
      const element = reactions[i].data.emotion;
      if (element === emotion) {
        count += 1;
      }
  }

  return count;
}

export function serializeEmoticonCount(count, emotion) {
  return count;
}

export default EMOTION_TO_IMAGE;
