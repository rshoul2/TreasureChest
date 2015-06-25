// Interaction variables
var rotateX, rotateY;
var translateZ;
var lastX, lastY;
var dX, dY;
var dragging;
var lightX, lightY, lightZ;
// WebGL variables
var gl, canvas;
// Arrays
var texCoordArray, vertexArray, normalArray, triangleArray;
// Locations
var projectionMatrixLocation, modelMatrixLocation;
var lightPositionLocation, lightColorLocation;
var vertexTexCoordLocation, vertexPositionLocation, vertexNormalLocation;
// Buffers
var texCoordBuffer, vertexBuffer, triangleBuffer, normalBuffer;
// Other variables
var modelMatrix, projectionMatrix, modelTexture, modelImage;

// Initialization function
function init() {
	// Init interaction variables
	rotateX = 0;
	rotateY = 0;
	translateZ = 5;
	dragging = false;
	lightX = 0;
	lightY = 0;
	lightZ = 0;

	// WebGL init
	canvas = document.getElementById('webgl');
	gl = getWebGLContext(canvas, false);

	// Shader initialization
	initShaders(gl, 
							document.getElementById("vertexShader").text, 
							document.getElementById("fragmentShader").text);

  // Uniform Locations
	projectionMatrixLocation = gl.getUniformLocation(gl.program, "projectionMatrix");
	modelMatrixLocation = gl.getUniformLocation(gl.program, "modelMatrix");
	lightPositionLocation = gl.getUniformLocation(gl.program, "lightPosition");
	lightColorLocation = gl.getUniformLocation(gl.program, "lightColor");

	// Buffer initialization
	vertexTexCoordLocation = gl.getAttribLocation(gl.program, "vertexTexCoord");
	vertexPositionLocation = gl.getAttribLocation(gl.program, "vertexPosition");
	vertexNormalLocation = gl.getAttribLocation(gl.program, "vertexNormal");
	gl.enableVertexAttribArray(vertexTexCoordLocation);
	gl.enableVertexAttribArray(vertexPositionLocation);
	gl.enableVertexAttribArray(vertexNormalLocation);

	texCoordArray = new Float32Array(flatten(texCoords));
	vertexArray = new Float32Array(flatten(vertices));
	normalArray = new Float32Array(flatten(normals));
	triangleArray = new Uint16Array(flatten(triangles));

	texCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, texCoordArray, gl.STATIC_DRAW);
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
  normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normalArray, gl.STATIC_DRAW);
  triangleBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleArray, gl.STATIC_DRAW);

  // Texture Initialization
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  modelTexture = gl.createTexture();
  modelImage = new Image();
  modelImage.onload = function() {
  	loadTexture(modelImage, modelTexture);
  }
  modelImage.crossOrigin = "anonymous";
  modelImage.src = "http://i.imgur.com/7thU1gD.jpg";
}

function draw() {
	// Compute the transform
	projectionMatrix = new Matrix4();
	projectionMatrix.setPerspective(45, 1, 1, 10);
	gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix.elements);

  modelMatrix = new Matrix4();
  modelMatrix.setTranslate(0, 0, -translateZ);
  modelMatrix.rotate(rotateX, 1, 0, 0);
  modelMatrix.rotate(rotateY, 0, 1, 0);
  gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix.elements);

	// Specify lighting parameters
  gl.uniform4f(lightPositionLocation, lightX, lightY, lightZ, 0);
  gl.uniform3f(lightColorLocation, 1.0, 1.0, 1.0);

  // Configuring attributes
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(vertexPositionLocation, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(vertexNormalLocation, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.vertexAttribPointer(vertexTexCoordLocation, 2, gl.FLOAT, false, 0, 0);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  gl.bindTexture(gl.TEXTURE_2D, modelTexture);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
  gl.drawElements(gl.TRIANGLES, triangleArray.length, gl.UNSIGNED_SHORT, 0);
}

function loadTexture(image, texture) {
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	requestAnimationFrame(draw);
}

// Interaction functions
function mouseDown(event) {
	dragging = true;
	lastX = event.clientX;
	lastY = event.clientY;
}

function mouseUp(event) {
	dragging = false;
}

function mouseMove(event) {
	if (dragging) {
		dX = event.clientX - lastX;
		dY = event.clientY - lastY;
		rotateY = rotateY + dX;
		rotateX = rotateX + dY;

		if (rotateX > 90.0)
			rotateX = 90.0;
		if (rotateX < -90.0)
			rotateX = -90.0;

		requestAnimationFrame(draw);
	}
	lastX = event.clientX;
	lastY = event.clientY;
}

function transZ() {
	translateZ = parseFloat(document.getElementById("zinput").value);
	document.getElementById("zoutput").innerHTML = translateZ;
	requestAnimationFrame(draw);
}

function changeLightX() {
	lightX = parseFloat(document.getElementById("lightxinput").value);
	document.getElementById("lightxoutput").innerHTML = lightX;
	requestAnimationFrame(draw);
}

function changeLightY() {
	lightY = parseFloat(document.getElementById("lightyinput").value);
	document.getElementById("lightyoutput").innerHTML = lightY;
	requestAnimationFrame(draw);
}

function changeLightZ() {
	lightZ = parseFloat(document.getElementById("lightzinput").value);
	document.getElementById("lightzoutput").innerHTML = lightZ;
	requestAnimationFrame(draw);
}

function flatten(a) {
	return a.reduce(function (b, v) { b.push.apply(b,v); return b }, []);
}