# Computer Graphics Assignment 1 (RayCasting and Illumination)
## @author Rachit Shrivastava
## @email rshriva@ncsu.edu

---

The index file is used to launch the assignment implementation. It involves one index and one js file.

---

The tasks completed in this assignment are - 

1. Part 1: Using ray casting, render unlit, colored spheres
2. Part 2: Using ray casting, render lit spheres

Apart from the given tasks some tasks for extra credits have been implemented as well - 
1. arbitrarily sized images (and interface windows)
2. multiple lights at arbitrary locations
3. shadows during ray casting
4. arbitrary viewing setups - only eye position can be changed

The code reads a JSON file from the desired location [https://ncsucgclass.github.io/prog1/spheres.json](https://ncsucgclass.github.io/prog1/spheres.json) by default and loads for the first time with Part 1 and Part 2 using all the values as mentioned in the assignment. The code comments are self-explanatory about what each function does.

I have made an HTML form, where you can fill in desired values. Please make sure you use integers or floating point numbers since, I'm not validating the inputs, so it may not show anything if any character or invlaid input is given.

Now if you want to see any extra credits implementations, you need to select multiple options from the provided HTML form.

First option lets you set width and height of the canvas element, which fulfills the requirement for given first extra credit.

Next you have two checkboxes, one for multiple lights and another for shadows, you can select either and verify the results. Checkin on multiple lights fetches another JSON file with the light parameters from [https://ncsucgclass.github.io/prog1/lights.json](https://ncsucgclass.github.io/prog1/lights.json). Its format should be something like this `{"x": 2, "y": 4, "z": -0.5, "ambient": [1,1,1], "diffuse": [1,1,1], "specular": [1,1,1]}` This fulfills the requirement for extra credits four and five from the assignment.

Last option provides you with different light locations, I'm not changing any viewUp or LookAt vector so this can be considered as partial implementation for extra credits two.

> Make sure that whenever you make any changes in form you press the Submit Button at the bottom to make sure the new values are beign accepted and the result will be shown to your screen in few seconds.