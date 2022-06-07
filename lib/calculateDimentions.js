const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
export default function calculateDimentions(height, width, cosX, cosY) {
  //Safety Buffer
  const SAFETY_BUFFER = 50;

  if (height >= width) {
    const targetHeight = cosY - SAFETY_BUFFER;
    const targetWidth = clamp(
      (targetHeight / height) * width,
      0,
      cosX - SAFETY_BUFFER
    );
    const returnOBJ = { height: targetHeight, width: targetWidth };
    // console.log(returnOBJ);
    return returnOBJ;
  }

  if (width > height) {
    const targetWidth = cosX - SAFETY_BUFFER;
    const targetHeight = clamp(
      (targetWidth / width) * height,
      0,
      cosY - SAFETY_BUFFER
    );
    const returnOBJ = { height: targetHeight, width: targetWidth };
    // console.log(returnOBJ);
    return returnOBJ;
  }
}
