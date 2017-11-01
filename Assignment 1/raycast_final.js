/**
 * Ray Casting Assignment 1 - Computer Graphics
 * @author Rachit Shrivastava
 * @email rshriva@ncsu.edu
 */

/* classes */ 

// Color constructor
class Color {
    constructor(r,g,b,a) {
        try {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                throw "color component not a number";
            else if ((r<0) || (g<0) || (b<0) || (a<0)) 
                throw "color component less than 0";
            else if ((r>255) || (g>255) || (b>255) || (a>255)) 
                throw "color component bigger than 255";
            else {
                this.r = r; this.g = g; this.b = b; this.a = a; 
            }
        } // end try
        
        catch (e) {
            console.log(e);
        }
    } // end Color constructor

        // Color change method
    change(r,g,b,a) {
        try {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                throw "color component not a number";
            else if ((r<0) || (g<0) || (b<0) || (a<0)) 
                throw "color component less than 0";
            else if ((r>255) || (g>255) || (b>255) || (a>255)) 
                throw "color component bigger than 255";
            else {
                this.r = r; this.g = g; this.b = b; this.a = a; 
            }
        } // end throw
        
        catch (e) {
            console.log(e);
        }
    } // end Color change method
} // end color class


/* utility functions */

// draw a pixel at x,y using color
function drawPixel(imagedata,x,y,color) {
    try {
        if ((typeof(x) !== "number") || (typeof(y) !== "number"))
            throw "drawpixel location not a number";
        else if ((x<0) || (y<0) || (x>=imagedata.width) || (y>=imagedata.height))
            throw "drawpixel location outside of image";
        else if (color instanceof Color) {
            var pixelindex = (y*imagedata.width + x) * 4;
            imagedata.data[pixelindex] = color.r;
            imagedata.data[pixelindex+1] = color.g;
            imagedata.data[pixelindex+2] = color.b;
            imagedata.data[pixelindex+3] = color.a;
        } else 
            throw "drawpixel color is not a Color";
    } // end try
    
    catch(e) {
        console.log(e);
    }
} // end drawPixel

// get the json from the standard class URL
function getJSONFile(url) {
    const INPUT_SPHERES_URL = url;
        
    // load the spheres file
    var httpReq = new XMLHttpRequest(); // a new http request
    httpReq.open("GET",INPUT_SPHERES_URL,false); // init the request
    httpReq.send(null); // send the request
    var startTime = Date.now();
    while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
        if ((Date.now()-startTime) > 3000)
            break;
    } // until its loaded or we time out after three seconds
    if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE)) {
        console.log*("Unable to open input spheres file!");
        return String.null;
    } else
        return JSON.parse(httpReq.response); 
} // end get json file


//GLOBAL VARIABLES
const VECTOR_LENGTH = 3;
var eye = [0.5, 0.5, -0.5];
var viewUpVector = [0, 1, 0];
var lookAtVector = [0, 0, 1];
var light = [2, 4, -0.5];
var lightColor = [1, 1, 1];
var shadows = false;
var multipleLights = false;
var lights;

/* Function called on editting the GUI values */
function updateData() {
    var myForm = document.forms["myForm"];
    var canvas = document.getElementById("viewport");
    
    canvas.width = parseFloat(myForm["canvasX"].value);
    canvas.height = parseFloat(myForm["canvasY"].value);

    eye[0] = parseFloat(myForm["eyeX"].value);
    eye[1] = parseFloat(myForm["eyeY"].value);
    eye[2] = parseFloat(myForm["eyeZ"].value);

    /* Not implemented
    viewUpVector[0] = parseFloat(myForm["upX"].value);
    viewUpVector[1] = parseFloat(myForm["upY"].value);
    viewUpVector[2] = parseFloat(myForm["upZ"].value);

    lookAtVector[0] = parseFloat(myForm["atX"].value);
    lookAtVector[1] = parseFloat(myForm["atY"].value);
    lookAtVector[2] = parseFloat(myForm["atZ"].value);
	*/

    if(myForm["lights"].checked) {
    	lights = getJSONFile("https://ncsucgclass.github.io/prog1/lights.json");    	
    	/*[
			{"x": 1, "y": 2, "z": -0.5, "ambient": [1,1,1], "diffuse": [1,1,1], "specular": [1,1,1]},
			{"x": -1, "y": -2, "z": -0.5, "ambient": [1,1,1], "diffuse": [1,1,1], "specular": [1,1,1]},
		];*/
    	multipleLights = true;
    }
    else {
    	multipleLights = false;
    }

    if(myForm["shadows"].checked) {
    	shadows = true;
    }
    else {
    	shadows = false;
    }

    //re-rendering the spheres
    rayCasting(canvas.getContext("2d"));
}


//Function to calculate dot product
function dotProduct(vec1, vec2, clamp = 0) {
    var result = 0;

    for(var i=0; i<VECTOR_LENGTH; i++) {
        result += vec1[i] * vec2[i];
    }

    if(result < 0 && clamp == 1) {
        result = 0;
    }

    return result;
}

//Function to calculate Normalized Vector
function calculateNormal(x, y, z) {
    var norm = [0,0,0];

    norm[0] = x/(Math.sqrt(x*x + y*y + z*z));
    norm[1] = y/(Math.sqrt(x*x + y*y + z*z));
    norm[2] = z/(Math.sqrt(x*x + y*y + z*z));
    
    return norm;
}

//Function to find Half Vector
function calculateHalfVector(l, v) {
    var h = [0,0,0];
    var base = 2;
    //Math.sqrt(l[0]*l[0] + l[1]*l[1] + l[2]*l[2]) + Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    for(var i=0; i < VECTOR_LENGTH; i++) {
        h[i] = (l[i] + v[i])/base;
    }

    return calculateNormal(h[0], h[1], h[2]) ;
}

/* Ray Casting Alogrithm */
function rayCasting(context) {
    var inputSpheres = getJSONFile("spheres.json");
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);

    if (inputSpheres != String.null) { 
        var pz = 0; // pixel coord init
        var x = 0, y = 0, z = 0; 
        var sphereRadius = 0; // init sphere radius
        var color = new Color(0,0,0,0); // init the sphere color

        var a = 0, b = 0, c = 0, rt = 0, rt1 = 0, rt2 = 0, determinant = 0;
        var x1 = 0, y1 = 0;
        var pe = [0,0,0], ec = [0,0,0];

        var normal = [0,0,0], n = [0,0,0];    		//Normal Vector
        var hv = [0,0,0];         					//Half Vector
        var lp = [0,0,0], l = [0,0,0];        		//Light Vector
        var v = [0,0,0], ep = [0,0,0];
        var red = 0, green = 0, blue = 0;
        var s = 1;                                  //shadow factor

        //for every pixel in 1x1 projection window
        for(var px=0; px<=2; px+=(1/w)) {
            for(var py=0; py<=2; py+=(1/h)) {
                //for every sphere
                for (var sp=0; sp<inputSpheres.length; sp++) {
                    pz = 0;
                    sphereRadius = inputSpheres[sp].r; // radius

                    ec[0] = eye[0] - inputSpheres[sp].x;
                    ec[1] = eye[1] - 1+inputSpheres[sp].y;    //Inverting the co-ordinates
                    ec[2] = eye[2] - inputSpheres[sp].z;
                    
                    /**
                     *   (P-E).(P-E)t^2 + 2(P-E).(E-C)t + (E-C).(E-C) = r^2
                     *       P = pixel - pixel on window
                     *       E = eye - eye
                     *       C = inputSpheres[s].(x,y) - center of each sphere
                     *       r = inputSpheres[s].r - radius of each sphere
                     *   Solve for root - rt
                     */

                    pe[0] = px - eye[0];
                    pe[1] = py - eye[1];
                    pe[2] = pz - eye[2];

                    a = dotProduct(pe, pe);
                    b = 2 * dotProduct(pe, ec);
                    c = dotProduct(ec, ec) - (sphereRadius*sphereRadius);

                    //Calculating the determinant value
                    determinant = (b*b) - (4*a*c);

                    if(determinant >= 0) {
                        //extracting roots
                        rt1 = (-b - Math.sqrt(determinant))/(2*a);
                        rt2 = (-b + Math.sqrt(determinant))/(2*a);
                        rt = rt2;
                        if(rt1 < rt2)
                            rt = rt1;

                        //Intersection points
                        x = eye[0] + (rt * (px - eye[0]));
                        y = eye[1] + (rt * (py - eye[1]));
                        z = eye[2] + (rt * (pz - eye[2]));
                        
                        /**
                         * We know that the color at any pixel is 
                         * determined by the Blin-Phong Illumination Model as
                         * ---------------------------------------------
                         * Color = La*Ka + Ld*Kd*(N.L) + Ls*Ks*(N.H)^n
                         * ---------------------------------------------
                         * N - unit Normal to the point of intersection
                         * L - unit vector for light direction
                         * H - Half vector for View and Reflection vectors
                         */

                        normal[0] = (x - inputSpheres[sp].x);
                        normal[1] = (y - 1+inputSpheres[sp].y);
                        normal[2] = (z - inputSpheres[sp].z);

                        ep[0] = eye[0] - x;
                        ep[1] = eye[1] - y;
                        ep[2] = eye[2] - z;
                        
                        v = calculateNormal(ep[0], ep[1], ep[2]);
	                    n = calculateNormal(normal[0], normal[1], normal[2]);

	                    //Condition to check for multiple light sources, if any
                        if(!multipleLights) {
                        	//Default case for single light source
                        	lp[0] = light[0] - x;
		                    lp[1] = 1 - light[1] - y;
		                    lp[2] = light[2] - z;	

	                        l = calculateNormal(lp[0], lp[1], lp[2]);
	                        hv = calculateHalfVector(l, v); //ep

                            /** Shadow
                             * Equation to find ray from each intersection pixel to light source,
                             * intersecting with every obejct in space
                             *
                             * Ds.Ds t^2 + 2Ds.(Px-C)t + (Px-C).(Px-C) - r^2 = 0
                             * Px - Intersection pixel
                             * Ds = -lp[] = [intersection pixel - light]
                             */
                            if(shadows) {
                                for(var sp1 = 0; sp1 < inputSpheres.length; sp1++) {
                                    if(sp == sp1) { 
                                    	s=1; 
                                    	continue; 
                                    }

                                    normal[0] = (x - inputSpheres[sp1].x);
                                    normal[1] = (y - 1+inputSpheres[sp1].y);
                                    normal[2] = (z - inputSpheres[sp1].z);

                                    a = dotProduct(lp, lp);
                                    b = 2 * dotProduct(lp, normal);
                                    c = dotProduct(normal, normal) - (inputSpheres[sp1].r*inputSpheres[sp1].r);

                                    determinant = (b*b) - (4*a*c);

                                    if(determinant >= 0) { 
                                    	rt1 = (-b - Math.sqrt(determinant))/(2*a);
                        				rt2 = (-b + Math.sqrt(determinant))/(2*a);
                        				if(rt1 >= 0 && rt2 >= 0)
                                    		s = 0; 
                                    } 
                                    else { s = 1; }
                                }
                            }
	                        
	                        red = (inputSpheres[sp].ambient[0]*lightColor[0]) + 
	                                s*(inputSpheres[sp].diffuse[0]*lightColor[0]*dotProduct(n, l)) + 
	                                s*(inputSpheres[sp].specular[0]*lightColor[0]*Math.pow(dotProduct(n, hv), inputSpheres[sp].n));

	                        green = (inputSpheres[sp].ambient[1]*lightColor[1]) + 
	                                s*(inputSpheres[sp].diffuse[1]*lightColor[1]*dotProduct(n, l)) + 
	                                s*(inputSpheres[sp].specular[1]*lightColor[1]*Math.pow(dotProduct(n, hv), inputSpheres[sp].n));

	                        blue = (inputSpheres[sp].ambient[2]*lightColor[2]) + 
	                                s*(inputSpheres[sp].diffuse[2]*lightColor[2]*dotProduct(n, l)) +
	                                s*(inputSpheres[sp].specular[2]*lightColor[2]*(Math.pow(dotProduct(n, hv), inputSpheres[sp].n)));
                        }
                        else {
                        	// For multiple lights read a JSON file
                        	red=0; green=0; blue=0;
                        	for(var ls=0; ls<lights.length; ls++) {
                        		lp[0] = lights[ls].x - x;
			                    lp[1] = 1 - lights[ls].y - y;
			                    lp[2] = lights[ls].z - z;	

		                        l = calculateNormal(lp[0], lp[1], lp[2]);
		                        hv = calculateHalfVector(l, v); //ep
		                        
		                        //Shadows
		                        if(shadows) {
	                                for(var sp1 = 0; sp1 < inputSpheres.length; sp1++) {
	                                    if(sp == sp1) { 
	                                    	s=1; 
	                                    	continue; 
	                                    }

	                                    normal[0] = (x - inputSpheres[sp1].x);
	                                    normal[1] = (y - 1+inputSpheres[sp1].y);
	                                    normal[2] = (z - inputSpheres[sp1].z);

	                                    a = dotProduct(lp, lp);
	                                    b = 2 * dotProduct(lp, normal);
	                                    c = dotProduct(normal, normal) - (inputSpheres[sp1].r*inputSpheres[sp1].r);

	                                    determinant = (b*b) - (4*a*c);

	                                    if(determinant >= 0) { 
	                                    	rt1 = (-b - Math.sqrt(determinant))/(2*a);
	                        				rt2 = (-b + Math.sqrt(determinant))/(2*a);
	                        				if(rt1 >= 0 && rt2 >= 0)
	                                    		s = 0; 
	                                    } 
	                                    else { s = 1; }
	                                }
	                            }
		                        red += (inputSpheres[sp].ambient[0]*lights[ls].ambient[0]) + 
		                                s*(inputSpheres[sp].diffuse[0]*lights[ls].ambient[0]*dotProduct(n, l)) + 
		                                s*(inputSpheres[sp].specular[0]*lights[ls].ambient[0]*Math.pow(dotProduct(n, hv), inputSpheres[sp].n));

		                        green += (inputSpheres[sp].ambient[1]*lights[ls].ambient[1]) + 
		                                s*(inputSpheres[sp].diffuse[1]*lights[ls].ambient[1]*dotProduct(n, l)) + 
		                                s*(inputSpheres[sp].specular[1]*lights[ls].ambient[1]*Math.pow(dotProduct(n, hv), inputSpheres[sp].n));

		                        blue += (inputSpheres[sp].ambient[2]*lights[ls].ambient[2]) + 
		                                s*(inputSpheres[sp].diffuse[2]*lights[ls].diffuse[2]*dotProduct(n, l)) +
		                                s*(inputSpheres[sp].specular[2]*lights[ls].specular[2]*(Math.pow(dotProduct(n, hv), inputSpheres[sp].n)));
                        	}
                        }
                        
                        //Clamping the results
                        if(red < 0) red=0;
                        if(green < 0) green=0;
                        if(blue < 0) blue=0;
                        if(red > 1) red=1;
                        if(green > 1) green=1;
                        if(blue > 1) blue=1;

                        //update the color values for every pixel
                        color.change(Math.round(red*255), Math.round(green*255), Math.round(blue*255), 255);

                        //Mapping world window co-ordinates to pixels for display
                        x1 = Math.round(px*w);
                        y1 = Math.round(py*h);

                        //Display on Projection window
                        drawPixel(imagedata, x1, y1, color);
                    }
                }
            }
        }
        context.putImageData(imagedata, 0, 0);
    }
}

/* main -- here is where execution begins after window load */

function main() {

    // Get the canvas and context
    var canvas = document.getElementById("viewport"); 
    var context = canvas.getContext("2d");
    
    rayCasting(context);
}
