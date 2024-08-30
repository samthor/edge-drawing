#version 300 es

in vec4 v_position;

/**
 * Simplest possible vertex shader.
 */
void main() {
  gl_Position = v_position;
}