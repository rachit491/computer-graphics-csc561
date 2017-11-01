# Computer Graphics Assignment 3 (Texturing and Transparency)
## @author Rachit Shrivastava
## @email rshriva@ncsu.edu

---

The index file is used to launch the assignment implementation. It involves one index, one rasterize css, one raterize js file and one gl-matrix js file.

---

The tasks completed in this assignment are - 

1. Part 1: render the input triangles and spheres, textured but without lighting
2. Part 2: render using both lighting and texture
3. Part 3: render using lighting, texture and transparency
4. Part 4: render using lighting, texture, transparency and transparent textures

Apart from the given tasks some tasks for extra credits have been implemented as well - 
1. off-axis and rectangular projections

The code reads two JSON files from the desired location [https://ncsucgclass.github.io/prog3/spheres.json](https://ncsucgclass.github.io/prog3/spheres.json) and [https://ncsucgclass.github.io/prog3/triangles.json](https://ncsucgclass.github.io/prog3/triangles.json) by default and loads for the first time with Part 1 to Part 4 using all the default values as mentioned in the assignment. The code comments are self-explanatory about what each function does.

I have made an HTML form, where you can fill in desired values. Please make sure you use integers or floating point numbers since, I'm not validating the inputs, so it may not show anything if any character or invlaid input is given.

The Window co-ordinates are the x-y co-ordinates and not pixel values, whereas width and height parameters involve pixels for resizing the canvas.

> Make sure that whenever you make any changes in form you press the Submit Button at the bottom to make sure the new values are beign accepted and the result will be shown to your screen in few seconds.