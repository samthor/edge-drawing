console.info('Hi');

// @ts-ignore
import colorFrag from './shaders/color.frag';
// @ts-ignore
import screenVert from './shaders/screen.vert';

function loadShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!status) {
    throw new TypeError(`couldn't compile shader:\n${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
}

function createGame(arg: { w: number; h: number; ratio?: number }) {
  const c = document.createElement('canvas');

  const ratio = arg.ratio ?? 4;

  c.width = arg.w;
  c.height = arg.h;

  c.style.width = `${arg.w / ratio}px`;
  c.style.height = `${arg.h / ratio}px`;
  c.style.imageRendering = 'pixelated';
  c.style.border = '2px solid red';

  const gl = c.getContext('webgl2')!;

  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, screenVert);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, colorFrag);

  const shaderProgram = gl.createProgram()!;
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  const status = gl.getProgramParameter(shaderProgram, gl.LINK_STATUS);
  if (!status) {
    throw new TypeError(`couldn't link shader program:\n${gl.getProgramInfoLog(shaderProgram)}`);
  }

  gl.useProgram(shaderProgram);
  gl.uniform2f(gl.getUniformLocation(shaderProgram, 'screenSize'), c.width, c.height);

  // texture

  const icon = document.getElementById('icon') as HTMLImageElement; // get the <img> tag
  console.info('uploading tex', icon.naturalWidth, icon.naturalHeight);

  const glTexture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0); // this is the 0th texture
  gl.bindTexture(gl.TEXTURE_2D, glTexture);

  // actually upload bytes
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, icon);

  // generates a version for different resolutions, needed to draw
  gl.generateMipmap(gl.TEXTURE_2D);

  // array of points

  const array = new Float32Array(1000); // allow for 500 sprites
  array[0] = 32; // x-value
  array[1] = 32; // y-value
  array[2] = 256; // x-value
  array[3] = 128; // y-value

  const glBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, array, gl.DYNAMIC_DRAW); // upload data

  // upload array

  const loc = gl.getAttribLocation(shaderProgram, 'spritePosition');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(
    loc,
    2, // because it was a vec2
    gl.FLOAT, // vec2 contains floats
    false, // ignored
    0, // each value is next to each other
    0, // starts at start of array
  );

  function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT); // clear screen
    gl.useProgram(shaderProgram); // activate our program
    gl.drawArrays(gl.POINTS, 0, 2); // run our program by drawing points (one for now)
  }
  draw();

  return { c, gl, draw };
}

const g = createGame({ w: 800, h: 400, ratio: 1 });
document.body.append(g.c);
