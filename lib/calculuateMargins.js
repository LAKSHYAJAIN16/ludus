export default function calculateMargins(height, width) {
  console.log({height, width});
  //Get Window Width and Height
  const v_width = window.innerWidth;
  const v_height = window.innerHeight;

  //Margins
  const mW = `${(v_width - width) / 2}px`;
  const mH = `${(v_height - height) / 2}px`;

  console.log({mW, mH});
  return { mW, mH };
}
