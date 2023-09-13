#version 300 es

precision mediump float;

out vec4 fragColor;
uniform sampler2D spriteTexture;  // texture we are drawing


void main() {
  int level = 1; // TODO: this is the 64-wide mipmap for our 128-size sprite


  float THRESH = 0.5;
  float THRESH_LOW = 0.9;

  fragColor = vec4(0.0, 0.0, 1.0, 1.0);

  ivec2 size = textureSize(spriteTexture, 0);
  ivec2 intPos = ivec2(gl_PointCoord * vec2(size)) / 2;
  vec4 here = texelFetch(spriteTexture, intPos, level);

  // If we're alpha >=0.5, then just draw the real image. We're supposed to show.
// vec4 here = texture(spriteTexture, gl_PointCoord);
  if (here.a > THRESH) {
    fragColor = here;
    fragColor = vec4(0.0, 1.0, 0.0, 1.0);
    return;
  }

  vec4 nUp = texelFetch(spriteTexture, intPos - ivec2(0, 1), level);
  vec4 nDown = texelFetch(spriteTexture, intPos + ivec2(0, 1), level);
  vec4 nLeft = texelFetch(spriteTexture, intPos - ivec2(1, 0), level);
  vec4 nRight = texelFetch(spriteTexture, intPos + ivec2(1, 0), level);

  // if (nLeft.a >= THRESH) {
  //   fragColor = vec4(1.0, 0.0, 0.0, 1.0);
  // }
  // return;

  float is_edge2 =
      max(THRESH_LOW, nUp.a) +
      max(THRESH_LOW, nDown.a) +
      max(THRESH_LOW, nLeft.a) +
      max(THRESH_LOW, nRight.a) +
      0.0;
  is_edge2 /= 4.0;

  if (is_edge2 > THRESH_LOW) {
    fragColor = vec4(1.0, 0.0, 0.0, 0.25);
  }


  // Do we have any neighbors >THRESH? This says.. reduce all by THRESH, add together, will be +ve
  // if there is at least one.
  float is_edge =
      max(THRESH, nUp.a) +
      max(THRESH, nDown.a) +
      max(THRESH, nLeft.a) +
      max(THRESH, nRight.a) +
      0.0;
  is_edge /= 4.0;

  if (is_edge > THRESH) {
    if (is_edge2 > THRESH_LOW) {
      fragColor = vec4(1.0, 1.0, 0.0, 1.0);
    } else {
      fragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
    return;
  }

  // if (is_edge > THRESH) {
  // }
  // if (is_edge > THRESH + 0.125) {
  //   fragColor = vec4(1.0, 0.0, 0.0, 1.0);
  // }


//   if (nDown.a < THRESH) {
//     fragColor = vec4(1.0, 0.0, 0.0, 1.0);
//   } else if (nUp.a < THRESH) {
// //    fragColor = vec4(1.0, 0.0, 1.0, 1.0);
//   } else {
// //    fragColor = vec4(0.0, 0.0, 1.0, 1.0);
//   }

//   if (nLeft.a < THRESH) {
//     fragColor = vec4(0.0, 0.0, 0.0, 1.0);
//   }

  // if (nUp.a < THRESH || nDown.a < THRESH) { // || nLeft.a < THRESH || nRight.a < THRESH) {
  //   fragColor = vec4(0.0, 0.0, 0.0, 1.0);
  //   return;
  // }

//  fragColor = vec4(1.0, 0.0, 1.0, here.a);
  // fragColor = here;
  // fragColor.rgb *= fragColor.a;
}
