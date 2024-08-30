console.info('Hi');

// @ts-ignore
import colorFrag from './shaders/color.frag';
// @ts-ignore
import pointScreenVert from './shaders/simple.vert';

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

  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, pointScreenVert);
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

  const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'v_position');
  const quadVertexBuffer = gl.createBuffer();
  const quadVertexBufferData = new Float32Array([
    -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, -1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0,
  ]);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, quadVertexBufferData, gl.STATIC_DRAW);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

  function draw() {
    gl.uniform2f(gl.getUniformLocation(shaderProgram, 'screenOffset'), 1024, 1024);

    gl.clear(gl.COLOR_BUFFER_BIT); // clear screen
    gl.useProgram(shaderProgram); // activate our program
    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  draw();

  return { c, gl, draw };
}

const g = createGame({ w: 800, h: 400, ratio: 1 });
document.body.append(g.c);
