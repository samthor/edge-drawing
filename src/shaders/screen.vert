#version 300 es

in vec2 spritePosition;  // position of sprite
uniform vec2 screenSize;        // width/height of screen

void main() {
  vec4 screenTransform = vec4(2.0 / screenSize.x, -2.0 / screenSize.y, -1.0, 1.0);
  gl_Position = vec4(spritePosition * screenTransform.xy + screenTransform.zw, 0.0, 1.0);
  gl_PointSize = 64.0;
}