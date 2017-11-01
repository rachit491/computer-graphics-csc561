/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const WIN_Z = 0;  // default graphics window z coord in world space
const WIN_LEFT = 0; const WIN_RIGHT = 1;  // default left and right x coords in world space
const WIN_BOTTOM = 0; const WIN_TOP = 1;  // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog2/triangles.json"; // triangles file loc
const INPUT_SPHERES_URL = "https://ncsucgclass.github.io/prog2/spheres.json"; // spheres file loc
var Eye = new vec3.fromValues(0.5, 0.5, -0.5); // default eye position in world space
var Up = new vec3.fromValues(0, 1, 0);
var Center = new vec3.fromValues(0.5, 0.5, 1);
var Light = [2, 4, -0.5];
var LightColor = [1, 1, 1];

var inputTriangles;
var trianglesLoaded = false;
var inputSpheres;
var spheresLoaded = false;

/* webgl globals */
var gl = null; // the all powerful gl object. It's all here folks!
var vertexBuffer = []; // this contains vertex coordinates in triples
var normalBuffer = [];
var triangleBuffer = []; // this contains indices into vertexBuffer in triples
var triangleAmbientColorBuffer = []; 
var triangleDiffuseColorBuffer = []; 
var triangleSpecularColorBuffer = []; 
var triBufferSize = 0; // the number of indices in the triangle buffer
var vertexPositionAttrib; // where to put position for vertex shader
var vertexNormalAttrib;
var vertexAmbientColorAttrib;
var vertexDiffuseColorAttrib;
var vertexSpecularColorAttrib;

var sphereVertexBuffer = [];
var sphereNormalBuffer = [];
var sphereTriangleBuffer = [];
var sphereTriangleAmbientColorBuffer = [];
var sphereTriangleDiffuseColorBuffer = [];
var sphereTriangleSpecularColorBuffer = [];

var shaderProgram;
var mvMatrix = mat4.create();   //ModelView Transformation Matrix
var pMatrix = mat4.create();    //Projection Matrix

var sphereXFM = [];
var mvMatrixSph = [];
var triangleXFM = [];
var mvMatrixTri = [];

// ASSIGNMENT HELPER FUNCTIONS

/* Function called on editting the GUI values */
function updateData() {
    var myForm = document.forms["myForm"];
    var canvas = document.getElementById("myWebGLCanvas");
    
    canvas.width = parseFloat(myForm["canvasX"].value);
    canvas.height = parseFloat(myForm["canvasY"].value);

    main();
}

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response); 
        } // end if good params
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input spheres

// set up the webGL environment
function setupWebGL() {

    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl"); // get a webgl object from it
    
    try {
      if (gl == null) {
        throw "unable to create gl context -- is your browser gl ready?";
      } else {
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
        gl.clearDepth(1.0); // use max when we clear the depth buffer
        gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
      }
    } // end try
    
    catch(e) {
      console.log(e);
    } // end catch
 
} // end setupWebGL

// read triangles in, load them into webgl buffers
function loadTriangles(selectedIndex) {
    if(!trianglesLoaded) {
        inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles");
        for (var whichSet=0; whichSet<inputTriangles.length; whichSet++) {
            triangleXFM[whichSet] = mat4.create();
            mvMatrixTri[whichSet] = mat4.create();
        }
    }
    
    if (inputTriangles != String.null) { 
        trianglesLoaded = true;
        for (var whichSet=0; whichSet<inputTriangles.length; whichSet++) {
            setTriangleBuffer(whichSet, selectedIndex);
        } // end for each triangle set 

    } // end if triangles found
} // end load triangles

function setTriangleBuffer(whichSet, selectedIndex) {
    var whichSetVert; // index of vertex in current triangle set
    var whichSetTri; // index of triangle in current triangle set
    var coordArray = []; // 1D array of vertex coords for WebGL
    var indexArray = []; // 1D array of vertex indices for WebGL
    var normalData = []; // 1D array of normala for WebGL
    var ambientColors = [];  // 1D array of colors for WebGL
    var diffuseColors = [];  // 1D array of colors for WebGL
    var specularColors = [];  // 1D array of colors for WebGL

    var vtxToAdd = []; // vtx coords to add to the coord array
    var colorToAdd = [];
    var normals = [];
    var triToAdd = [];
    var aColor, dColor, sColor;
    
    if(whichSet != selectedIndex) {
        aColor = inputTriangles[whichSet].material.ambient;
        dColor = inputTriangles[whichSet].material.diffuse;
        sColor = inputTriangles[whichSet].material.specular;
    }
    else {
        aColor = [0.5, 0.5, 0];
        dColor = [0.5, 0.5, 0];
        sColor = [0, 0, 0];
    }
            
    // set up the vertex coord array
    for (whichSetVert=0; whichSetVert<inputTriangles[whichSet].vertices.length; whichSetVert++) {
        vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert];
        normals = inputTriangles[whichSet].normals[whichSetVert];
        coordArray.push(vtxToAdd[0], vtxToAdd[1], vtxToAdd[2]);
        normalData.push(normals[0], normals[1], normals[2]);

        ambientColors.push(aColor[0], aColor[1], aColor[2], 1.0);
        diffuseColors.push(dColor[0], dColor[1], dColor[2], 1.0);
        specularColors.push(sColor[0], sColor[1], sColor[2], inputTriangles[whichSet].material.n);
    } // end for vertices in set
    
    // set up the triangle index array, adjusting indices across sets
    for (whichSetTri=0; whichSetTri<inputTriangles[whichSet].triangles.length; whichSetTri++) {
        triToAdd = inputTriangles[whichSet].triangles[whichSetTri];
        indexArray.push(triToAdd[0], triToAdd[1],triToAdd[2]);
    } // end for triangles in set

    //set tp the triangle colors

    //vtxBufferSize += inputTriangles[whichSet].vertices.length; // total number of vertices
    //triBufferSize += inputTriangles[whichSet].triangles.length; // total number of tris
    //triBufferSize *= 3; // now total number of indices

    // console.log("coordinates: "+coordArray.toString());
    // console.log("numverts: "+vtxBufferSize);
    // console.log("indices: "+indexArray.toString());
    // console.log("numindices: "+triBufferSize);
    
    // send the vertex coords to webGL
    vertexBuffer[whichSet] = gl.createBuffer(); // init empty vertex coord buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer[whichSet]); // activate that buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coordArray), gl.STATIC_DRAW); // coords to that buffer
    vertexBuffer[whichSet].itemSize = 3;
    vertexBuffer[whichSet].numItems = coordArray.length / 3;
    
    // send the normal data to webGL
    normalBuffer[whichSet] = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer[whichSet]); 
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW); // coords to that buffer
    normalBuffer[whichSet].itemSize = 3;
    normalBuffer[whichSet].numItems = normalData.length / 3;

    // send the triangle indices to webGL
    triangleBuffer[whichSet] = gl.createBuffer(); // init empty triangle index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer[whichSet]); // activate that buffer
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW); // indices to that buffer
    triangleBuffer[whichSet].itemSize = 1;
    triangleBuffer[whichSet].numItems = indexArray.length;

    triangleAmbientColorBuffer[whichSet] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleAmbientColorBuffer[whichSet]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ambientColors), gl.STATIC_DRAW);
    triangleAmbientColorBuffer[whichSet].itemSize = 4;
    triangleAmbientColorBuffer[whichSet].numItems = ambientColors.length / 4;

    triangleDiffuseColorBuffer[whichSet] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleDiffuseColorBuffer[whichSet]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(diffuseColors), gl.STATIC_DRAW);
    triangleDiffuseColorBuffer[whichSet].itemSize = 4;
    triangleDiffuseColorBuffer[whichSet].numItems = diffuseColors.length / 4;

    triangleSpecularColorBuffer[whichSet] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleSpecularColorBuffer[whichSet]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(specularColors), gl.STATIC_DRAW);
    triangleSpecularColorBuffer[whichSet].itemSize = 4;
    triangleSpecularColorBuffer[whichSet].numItems = specularColors.length / 4;
}

function loadSpheres(selectedIndex) {
    if(!spheresLoaded) {
 	    inputSpheres = getJSONFile(INPUT_SPHERES_URL, "spheres");
        for(var index = 0; index < inputSpheres.length; index++) {
            sphereXFM[index] = mat4.create();
            mvMatrixSph[index] = mat4.create();
        }
    }

	if(inputSpheres != String.null) {
        spheresLoaded = true;
        for(var index = 0; index < inputSpheres.length; index++) {
            setSphereBuffer(index, selectedIndex);
        }
	}
}

function setSphereBuffer(index, selectedIndex) {
    var vertexPosition = [];
    var indexValues = [];
    var ambientColors = [];
    var diffuseColors = [];
    var specularColors = [];
    var normalData = [];
    var aColor, dColor, sColor;
    var latitudeBands = 20;
    var longitudeBands = 20;
    var radius, posX, posY, posZ;

    radius = inputSpheres[index].r;
    posX = inputSpheres[index].x;
    posY = inputSpheres[index].y;
    posZ = inputSpheres[index].z;
    
    if(index != selectedIndex) {
        aColor = inputSpheres[index].ambient;
        dColor = inputSpheres[index].diffuse;
        sColor = inputSpheres[index].specular;
    }
    else {
        aColor = [0.5, 0.5, 0];
        dColor = [0.5, 0.5, 0];
        sColor = [0, 0, 0];
    }

    for(var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for(var longNumber=0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;

            normalData.push(x);
            normalData.push(y);
            normalData.push(z);

            vertexPosition.push((radius * x) + posX);
            vertexPosition.push((radius * y) + posY);
            vertexPosition.push((radius * z) + posZ);

            ambientColors.push(aColor[0], aColor[1], aColor[2], 1.0);
            diffuseColors.push(dColor[0], dColor[1], dColor[2], 1.0);
            specularColors.push(sColor[0], sColor[1], sColor[2], inputSpheres[index].n);
        }
    }

    for(var latNumber = 0; latNumber < latitudeBands; latNumber++) {
        for(var longNumber = 0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexValues.push(first);
            indexValues.push(second);
            indexValues.push(first + 1);

            indexValues.push(second);
            indexValues.push(second + 1);
            indexValues.push(first + 1);
        }
    }

    // send the vertex coords to webGL
    sphereVertexBuffer[index] = gl.createBuffer(); // init empty vertex coord buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexBuffer[index]); // activate that buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosition), gl.STATIC_DRAW); // coords to that buffer
    sphereVertexBuffer[index].itemSize = 3;
    sphereVertexBuffer[index].numItems = vertexPosition.length / 3;

    sphereNormalBuffer[index] = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalBuffer[index]); 
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW); 
    sphereNormalBuffer[index].itemSize = 3;
    sphereNormalBuffer[index].numItems = normalData.length / 3;
    
    // send the triangle indices to webGL
    sphereTriangleBuffer[index] = gl.createBuffer(); // init empty triangle index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereTriangleBuffer[index]); // activate that buffer
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexValues), gl.STATIC_DRAW); // indices to that buffer
    sphereTriangleBuffer[index].itemSize = 1;
    sphereTriangleBuffer[index].numItems = indexValues.length;

    sphereTriangleAmbientColorBuffer[index] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereTriangleAmbientColorBuffer[index]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ambientColors), gl.STATIC_DRAW);
    sphereTriangleAmbientColorBuffer[index].itemSize = 4;
    sphereTriangleAmbientColorBuffer[index].numItems = ambientColors.length / 4;

    sphereTriangleDiffuseColorBuffer[index] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereTriangleDiffuseColorBuffer[index]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(diffuseColors), gl.STATIC_DRAW);
    sphereTriangleDiffuseColorBuffer[index].itemSize = 4;
    sphereTriangleDiffuseColorBuffer[index].numItems = diffuseColors.length / 4;

    sphereTriangleSpecularColorBuffer[index] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereTriangleSpecularColorBuffer[index]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(specularColors), gl.STATIC_DRAW);
    sphereTriangleSpecularColorBuffer[index].itemSize = 4;
    sphereTriangleSpecularColorBuffer[index].numItems = specularColors.length / 4;
}

// setup the webGL shaders
function setupShaders() {
    
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float;

	    varying vec3 vTransformedNormal;
	    varying vec4 vPosition;

	    uniform bool uUseLighting;
	    uniform bool uUseTextures;

	    uniform vec3 uPointLightingLocation;
	    uniform vec3 uPointLightingColor;

	    varying vec4 vAmbientColor;
        varying vec4 vDiffuseColor;
        varying vec4 vSpecularColor;

	    void main(void) {
	        vec3 lightWeighting;
            vec3 lightDirection = normalize(uPointLightingLocation - vPosition.xyz);
            
            vec3 normal = normalize(vTransformedNormal);
            vec3 eyeDirection = normalize(-vPosition.xyz);
            vec3 reflectionDirection = reflect(-lightDirection, normal);

            float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), vSpecularColor.a);
            //vSpecularColor.a using this as a hack to store n value related to specular color

            float directionalLightWeighting = max(dot(normal, lightDirection), 0.0);

            lightWeighting = uPointLightingColor;

	        gl_FragColor = vec4(vAmbientColor.rgb * lightWeighting, vAmbientColor.a) + 
                        vec4(vDiffuseColor.rgb * lightWeighting * directionalLightWeighting, vDiffuseColor.a) + 
                        vec4(vSpecularColor.rgb * lightWeighting * specularLightWeighting, vSpecularColor.a);
	    }
    `;
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 vertexPosition;
	    attribute vec3 vertexNormal;
        attribute vec4 vertexAmbientColor;
        attribute vec4 vertexDiffuseColor;
        attribute vec4 vertexSpecularColor;

	    uniform mat4 uMVMatrix;
	    uniform mat4 uPMatrix;
	    uniform mat3 uNMatrix;

	    varying vec3 vTransformedNormal;
	    varying vec4 vPosition;
        varying vec4 vAmbientColor;
        varying vec4 vDiffuseColor;
	    varying vec4 vSpecularColor;

	    void main(void) {
	        vPosition = uMVMatrix * vec4(vertexPosition, 1.0);
	        gl_Position = uPMatrix * vPosition;
	        vTransformedNormal = uNMatrix * vertexNormal;

	        vAmbientColor = vertexAmbientColor;
            vDiffuseColor = vertexDiffuseColor;
            vSpecularColor = vertexSpecularColor;
	    }
    `;
    
    try {
        // console.log("fragment shader: "+fShaderCode);
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        // console.log("vertex shader: "+vShaderCode);
        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
            
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                // get pointer to vertex shader input
                vertexPositionAttrib = gl.getAttribLocation(shaderProgram, "vertexPosition"); 
                gl.enableVertexAttribArray(vertexPositionAttrib); // input to shader from array
        
                vertexNormalAttrib = gl.getAttribLocation(shaderProgram, "vertexNormal");
                gl.enableVertexAttribArray(vertexNormalAttrib);

                // get pointer to fragment shader input
                vertexAmbientColorAttrib = gl.getAttribLocation(shaderProgram, "vertexAmbientColor");
                gl.enableVertexAttribArray(vertexAmbientColorAttrib);  // input to sahder from array
                vertexDiffuseColorAttrib = gl.getAttribLocation(shaderProgram, "vertexDiffuseColor");
                gl.enableVertexAttribArray(vertexDiffuseColorAttrib);  // input to sahder from array
                vertexSpecularColorAttrib = gl.getAttribLocation(shaderProgram, "vertexSpecularColor");
                gl.enableVertexAttribArray(vertexSpecularColorAttrib);  // input to sahder from array

                shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
                shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
                shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
        		shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
        		shaderProgram.pointLightingColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingColor");
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

function setMatrixUniforms(newMVMatrix) {
    //setting up uniforms for th shader program
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, newMVMatrix);
    
    gl.uniform3f(shaderProgram.pointLightingLocationUniform, Light[0], Light[1], Light[2]);
    gl.uniform3f(shaderProgram.pointLightingColorUniform, LightColor[0], LightColor[1], LightColor[2]);

    var normalMatrix = mat3.create();
    mat3.fromMat4(normalMatrix, mvMatrix);
    mat3.invert(normalMatrix, normalMatrix);
    mat3.transpose(normalMatrix, normalMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}

// render the loaded model
function renderTriangles(selectedIndexTri) {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers

    mat4.perspective(pMatrix, 90*Math.PI/180, gl.viewportWidth / gl.viewportHeight, 0.5, 1.5);
    //mat4.scale(pMatrix, pMatrix, [-1, 1, 1]);
    //console.log("Projection: " + pMatrix);
    
    mat4.lookAt(mvMatrix, Eye, Center, Up);
    //console.log("Model: " + mvMatrix);

    for(var i=0; i<inputTriangles.length; i++) {
        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer[i]); // activate
        gl.vertexAttribPointer(vertexPositionAttrib, vertexBuffer[i].itemSize, gl.FLOAT, false, 0, 0); // feed

        //color buffer:
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleAmbientColorBuffer[i]);
        gl.vertexAttribPointer(vertexAmbientColorAttrib, triangleAmbientColorBuffer[i].itemSize, gl.FLOAT, false, 0, 0);  // feed
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleDiffuseColorBuffer[i]);
        gl.vertexAttribPointer(vertexDiffuseColorAttrib, triangleDiffuseColorBuffer[i].itemSize, gl.FLOAT, false, 0, 0);  // feed
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleSpecularColorBuffer[i]);
        gl.vertexAttribPointer(vertexSpecularColorAttrib, triangleSpecularColorBuffer[i].itemSize, gl.FLOAT, false, 0, 0);  // feed

        //triangle normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer[i]); // activate
        gl.vertexAttribPointer(vertexNormalAttrib, normalBuffer[i].itemSize, gl.FLOAT, false, 0, 0); // feed

        // triangle buffer: activate and render
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer[i]); // activate
        mat4.multiply(mvMatrixTri[i], mvMatrix, triangleXFM[i]);
        setMatrixUniforms(mvMatrixTri[i]);
        gl.drawElements(gl.TRIANGLES, triangleBuffer[i].numItems, gl.UNSIGNED_SHORT, 0); // render
    }

} // end render triangles

function renderSpheres(selectedIndexSph) {

    for(var i=0; i < inputSpheres.length; i++) {
        // vertex buffer: activate and feed into vertex shader
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexBuffer[i]); // activate
        gl.vertexAttribPointer(vertexPositionAttrib, sphereVertexBuffer[i].itemSize, gl.FLOAT, false, 0, 0); // feed

        //color buffer for sphere
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereTriangleAmbientColorBuffer[i]);
        gl.vertexAttribPointer(vertexAmbientColorAttrib, sphereTriangleAmbientColorBuffer[i].itemSize, gl.FLOAT, false, 0, 0);  // feed
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereTriangleDiffuseColorBuffer[i]);
        gl.vertexAttribPointer(vertexDiffuseColorAttrib, sphereTriangleDiffuseColorBuffer[i].itemSize, gl.FLOAT, false, 0, 0);  // feed
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereTriangleSpecularColorBuffer[i]);
        gl.vertexAttribPointer(vertexSpecularColorAttrib, sphereTriangleSpecularColorBuffer[i].itemSize, gl.FLOAT, false, 0, 0);  // feed

        //normal buffer for sphere
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalBuffer[i]); // activate
        gl.vertexAttribPointer(vertexNormalAttrib, sphereNormalBuffer[i].itemSize, gl.FLOAT, false, 0, 0); // feed

        // triangle buffer: activate and render
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereTriangleBuffer[i]); // activate
        mat4.multiply(mvMatrixSph[i], mvMatrix, sphereXFM[i]);
        setMatrixUniforms(mvMatrixSph[i]);
        gl.drawElements(gl.TRIANGLES, sphereTriangleBuffer[i].numItems, gl.UNSIGNED_SHORT, 0); // render
    }
}

var sphereNumber = 0;
var triangleNumber = 0;
var sphereHighlight = false;
var triangleHighlight = false;
var up = false;
var down = false;

//Function to handle key inputs
function handleKeys(e) {
    if(e.keyCode == 27) {
        //escape - reset
        reset();
    }

    if(e.keyCode == 8) {
        //backspace - reset Transformation
        resetTransform();
    }

    if(e.keyCode == 38) {
        //up
        clearSelection();
        sphereHighlight = true;
        triangleHighlight = false;
        up = true;
        if(down) {
            down = false;
            sphereNumber++;
        }
        sphereNumber %= inputSpheres.length;
        loadSpheres(sphereNumber);
        render();
        sphereNumber++;
    }

    if(e.keyCode == 40) {
        //down
        clearSelection();
        if(up) {
           up = false;
           sphereNumber--; 
        }  
        down = true;
        sphereHighlight = true;
        triangleHighlight = false;
        if(sphereNumber == 0)   
            sphereNumber = inputSpheres.length;
        sphereNumber--;
        sphereNumber %= inputSpheres.length;
        loadSpheres(sphereNumber);
        render();
    }

    if(e.keyCode == 39) {
        //next - right
        clearSelection();
        sphereHighlight = false;
        triangleHighlight = true;
        up = true;
        if(down) {
            down = false;
            sphereNumber++;
        }
        triangleNumber %= inputTriangles.length;
        loadTriangles(triangleNumber);
        render();
        triangleNumber++;
    }

    if(e.keyCode == 37) {
        //previous - left
        clearSelection();
        if(up) {
           up = false;
           triangleNumber--; 
        }  
        down = true;
        sphereHighlight = false;
        triangleHighlight = true;
        if(triangleNumber == 0)   
            triangleNumber = inputTriangles.length;
        triangleNumber--;
        triangleNumber %= inputSpheres.length;
        loadTriangles(triangleNumber);
        render();
    }

    if(e.keyCode == 32) {
        //spacebar - clear selection
        clearSelection();
    }

    //console.log(e.keyCode);
}

function handleKeyPress(e) {
	console.log(e.keyCode + "keyPress");
    var sel;
	
	switch(e.keyCode) {
		case  65: Center[0] -= 0.05; render(); break;	// A
		case  68: Center[0] += 0.05; render(); break;	// D

		case  81: // Q
                    if((Up[0] == 0 && Up[1] == 1) || (Up[0] < 0 && Up[1] > 0)) { 
                        Up[0] -= 0.05; 
                        Up[1] -= 0.05;
                    }
                    else if((Up[0] == 0 && Up[1] == -1) || (Up[0] > 0 && Up[1] < 0)) { 
                        Up[0] += 0.05; 
                        Up[1] += 0.05;
                    }
                    else if((Up[0] == 1 && Up[1] == 0) || (Up[0] > 0 && Up[1] > 0)) { 
                        Up[0] -= 0.05; 
                        Up[1] += 0.05;
                    }
                    else if((Up[0] == -1 && Up[1] == 0) || (Up[0] < 0 && Up[1] < 0)) { 
                        Up[0] += 0.05; 
                        Up[1] -= 0.05;
                    }
                    render(); break;	
		case  69:  // E
                    if((Up[0] == 0 && Up[1] == 1) || (Up[0] < 0 && Up[1] > 0)) { 
                        Up[0] += 0.05; 
                        Up[1] += 0.05;
                    }
                    else if((Up[0] == 0 && Up[1] == -1) || (Up[0] > 0 && Up[1] < 0)) { 
                        Up[0] -= 0.05; 
                        Up[1] -= 0.05;
                    }
                    else if((Up[0] == 1 && Up[1] == 0) || (Up[0] > 0 && Up[1] > 0)) {
                        Up[0] += 0.05; 
                        Up[1] -= 0.05;
                    }
                    else if((Up[0] == -1 && Up[1] == 0) || (Up[0] < 0 && Up[1] < 0)) { 
                        Up[0] -= 0.05; 
                        Up[1] += 0.05;
                    }
                    render(); break;   

		case  83: Center[1] -= 0.05; render(); break;	// S
		case  87: Center[1] += 0.05; render(); break;	// W

		case  97: Eye[0] -= 0.05;			//a
      			  Center[0] -= 0.05;
                  render();
      			  break;
      	case 100: Eye[0] += 0.05;			//d
      			  Center[0] += 0.05;
                  render();
      			  break;

      	case 113: Eye[1] -= 0.05;			//q
      			  Center[1] -= 0.05;
                  render();
      			  break;
      	case 101: Eye[1] += 0.05;			//e
      			  Center[1] += 0.05;
                  render();
      			  break;

      	case 119: Eye[2] -= 0.05;			//w
      			  Center[2] -= 0.05;
                  render();
      			  break;
      	case 115: Eye[2] += 0.05;			//s
      			  Center[2] += 0.05; 
                  render();
      			  break;

        /**
         * Selection tranformation starts here  
         */
        case 107: //k
                  if(sphereHighlight) {
                    if(up) {
                        sphereNumber--;
                        up = false;
                    }  
                    sel = sphereNumber;
                    mat4.translate(sphereXFM[sel], sphereXFM[sel], [0.05, 0, 0]);
                    render();
                  }
                  if(triangleHighlight) {
                    if(up) {
                        triangleNumber--;
                        up = false;
                    }  
                    sel = triangleNumber;
                    mat4.translate(triangleXFM[sel], triangleXFM[sel], [0.05, 0, 0]);
                    render();
                  }
                  break;    
        case 59: //;
                  if(sphereHighlight) {
                    if(up) {
                        sphereNumber--;
                        up = false;
                    }
                    sel = sphereNumber;
                    mat4.translate(sphereXFM[sel], sphereXFM[sel], [-0.05, 0, 0]);
                    render();
                  }
                  if(triangleHighlight) {
                    if(up) {
                        triangleNumber--;
                        up = false;
                    }  
                    sel = triangleNumber;
                    mat4.translate(triangleXFM[sel], triangleXFM[sel], [-0.05, 0, 0]);
                    render();
                  }
                  break;     

        case 105: //i
                  if(sphereHighlight) {
                    if(up) {
                        sphereNumber--;
                        up = false;
                    }  
                    sel = sphereNumber;
                    mat4.translate(sphereXFM[sel], sphereXFM[sel], [0, 0.05, 0]);
                    render();
                  }
                  if(triangleHighlight) {
                    if(up) {
                        triangleNumber--;
                        up = false;
                    }  
                    sel = triangleNumber;
                    mat4.translate(triangleXFM[sel], triangleXFM[sel], [0, 0.05, 0]);
                    render();
                  }
                  break;    
        case 112: //p
                  if(sphereHighlight) {
                    if(up) {
                        sphereNumber--;
                        up = false;
                    }
                    sel = sphereNumber;
                    mat4.translate(sphereXFM[sel], sphereXFM[sel], [0, -0.05, 0]);
                    render();
                  }
                  if(triangleHighlight) {
                    if(up) {
                        triangleNumber--;
                        up = false;
                    }  
                    sel = triangleNumber;
                    mat4.translate(triangleXFM[sel], triangleXFM[sel], [0, -0.05, 0]);
                    render();
                  }
                  break;     

        case 111: //o
                  if(sphereHighlight) {
                    if(up) {
                        sphereNumber--;
                        up = false;
                    }  
                    sel = sphereNumber;
                    mat4.translate(sphereXFM[sel], sphereXFM[sel], [0, 0, 0.05]);
                    render();
                  }
                  if(triangleHighlight) {
                    if(up) {
                        triangleNumber--;
                        up = false;
                    }  
                    sel = triangleNumber;
                    mat4.translate(triangleXFM[sel], triangleXFM[sel], [0, 0, 0.05]);
                    render();
                  }
                  break;    
        case 108: //l
                  if(sphereHighlight) {
                    if(up) {
                        sphereNumber--;
                        up = false;
                    }
                    sel = sphereNumber;
                    mat4.translate(sphereXFM[sel], sphereXFM[sel], [0, 0, -0.05]);
                    render();
                  }
                  if(triangleHighlight) {
                    if(up) {
                        triangleNumber--;
                        up = false;
                    }  
                    sel = triangleNumber;
                    mat4.translate(triangleXFM[sel], triangleXFM[sel], [0, 0, -0.05]);
                    render();
                  }
                  break;     

        case 75: //K
                  if(sphereHighlight) {
                    if(up) {
                        sphereNumber--;
                        up = false;
                    }  
                    sel = sphereNumber;
                    mat4.rotateY(sphereXFM[sel], sphereXFM[sel], 5*Math.PI/180);
                    render();
                  }
                  if(triangleHighlight) {
                    if(up) {
                        triangleNumber--;
                        up = false;
                    }  
                    sel = triangleNumber;
                    mat4.rotateY(triangleXFM[sel], triangleXFM[sel], 5*Math.PI/180);
                    render();
                  }
                  break;    
        case 58: //: - Shift+;
                  if(sphereHighlight) {
                    if(up) {
                        sphereNumber--;
                        up = false;
                    }
                    sel = sphereNumber;
                    mat4.rotateY(sphereXFM[sel], sphereXFM[sel], -5*Math.PI/180);
                    render();
                  }
                  if(triangleHighlight) {
                    if(up) {
                        triangleNumber--;
                        up = false;
                    }  
                    sel = triangleNumber;
                    mat4.rotateY(triangleXFM[sel], triangleXFM[sel], -5*Math.PI/180);
                    render();
                  }
                  break;

        case 79: //O
                  if(sphereHighlight) {
                    if(up) {
                        sphereNumber--;
                        up = false;
                    }  
                    sel = sphereNumber;
                    mat4.rotateX(sphereXFM[sel], sphereXFM[sel], 5*Math.PI/180);
                    render();
                  }
                  if(triangleHighlight) {
                    if(up) {
                        triangleNumber--;
                        up = false;
                    }  
                    sel = triangleNumber;
                    mat4.rotateX(triangleXFM[sel], triangleXFM[sel], 5*Math.PI/180);
                    render();
                  }
                  break;    
        case 76: //L
                  if(sphereHighlight) {
                    if(up) {
                        sphereNumber--;
                        up = false;
                    }
                    sel = sphereNumber;
                    mat4.rotateX(sphereXFM[sel], sphereXFM[sel], -5*Math.PI/180);
                    render();
                  }
                  if(triangleHighlight) {
                    if(up) {
                        triangleNumber--;
                        up = false;
                    }  
                    sel = triangleNumber;
                    mat4.rotateX(triangleXFM[sel], triangleXFM[sel], -5*Math.PI/180);
                    render();
                  }
                  break;

        case 73: //I
                  if(sphereHighlight) {
                    if(up) {
                        sphereNumber--;
                        up = false;
                    }  
                    sel = sphereNumber;
                    mat4.rotateZ(sphereXFM[sel], sphereXFM[sel], 5*Math.PI/180);
                    render();
                  }
                  if(triangleHighlight) {
                    if(up) {
                        triangleNumber--;
                        up = false;
                    }  
                    sel = triangleNumber;
                    mat4.rotateZ(triangleXFM[sel], triangleXFM[sel], 5*Math.PI/180);
                    render();
                  }
                  break;    
        case 80: //P
                  if(sphereHighlight) {
                    if(up) {
                        sphereNumber--;
                        up = false;
                    }
                    sel = sphereNumber;
                    mat4.rotateZ(sphereXFM[sel], sphereXFM[sel], -5*Math.PI/180);
                    render();
                  }
                  if(triangleHighlight) {
                    if(up) {
                        triangleNumber--;
                        up = false;
                    }  
                    sel = triangleNumber;
                    mat4.rotateZ(triangleXFM[sel], triangleXFM[sel], -5*Math.PI/180);
                    render();
                  }
                  break;
	}
}

//to render the objects
function render() {
    renderTriangles();
    renderSpheres();
}

//clear of the highlights
function clearSelection() {
    loadSpheres();
    loadTriangles();
    render();
}

//on escape key press
function reset() {
    sphereNumber = 0;
    triangleNumber = 0;

    Eye = [0.5, 0.5, -0.5];
    Center = [0.5, 0.5, 1];
    Up = [0, 1, 0];
    
    clearSelection();
}

//clearing off the transformation
function resetTransform() {
    for (var whichSet=0; whichSet<inputTriangles.length; whichSet++) {
        triangleXFM[whichSet] = mat4.create();
        mvMatrixTri[whichSet] = mat4.create();
    }

    for(var index = 0; index < inputSpheres.length; index++) {
        sphereXFM[index] = mat4.create();
        mvMatrixSph[index] = mat4.create();
    }

    clearSelection();
}

/* MAIN -- HERE is where execution begins after window load */

function main() {
  
    setupWebGL(); // set up the webGL environment
    setupShaders(); // setup the webGL shaders
    loadTriangles(); // load in the triangles from tri file
    loadSpheres();	// load in the spheres
    
    document.onkeydown = handleKeys;
    document.onkeypress = handleKeyPress;
    
    render();

} // end main