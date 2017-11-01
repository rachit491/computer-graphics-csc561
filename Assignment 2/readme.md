# Computer Graphics Assignment 2 (on Rasterization)
## @author Rachit Shrivastava
## @email rshriva@ncsu.edu

---

The index file is used to launch the assignment implementation. It involves one index and one app js file, one gl-matrix js file.

---

The tasks completed in this assignment are - 

1. Part 1: render the input triangles, without lighting
2. Part 2: model and render the input spheres, without lighting
3. Part 3: light the spheres and triangles
4. Part 4: interactively change the view of the spheres and triangles
5. Part 5: interactively transform the spheres and triangles

Apart from the given tasks some tasks for extra credits have been implemented as well - 
1. arbitrarily sized viewports
2. smooth shading with vertex normals

The code reads two JSON files from the desired location [https://ncsucgclass.github.io/prog2/spheres.json](https://ncsucgclass.github.io/prog2/spheres.json) and [https://ncsucgclass.github.io/prog2/triangles.json](https://ncsucgclass.github.io/prog2/triangles.json) by default and loads for the first time with Part 1 to Part 5 using all the default values as mentioned in the assignment. The code comments are self-explanatory about what each function does.

I have made an HTML form, where you can fill in desired values. Please make sure you use integers or floating point numbers since, I'm not validating the inputs, so it may not show anything if any character or invlaid input is given.

The smooth shading with vertex normal can be checked with the setSphereBuffer() function and vShaderCode & fShaderCode functions where I'm using vertex normals to calculate a transformed matrix vTransformedNormal = uNMatrix * vertexNormal;

> Make sure that whenever you make any changes in form you press the Submit Button at the bottom to make sure the new values are beign accepted and the result will be shown to your screen in few seconds.