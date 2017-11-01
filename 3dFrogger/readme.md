# Computer Graphics CSC561 (3D Frogger)
## @author Rachit Shrivastava
## @email rshriva@ncsu.edu

---

Implemented Frogger using three.js
Helper files have been used for loading .obj, .mtl files - OBJLoader and MTLLoader.
A modified Camera from threeJS, called CombinedCamera has been used.
Keyboard events have been detected using THREEx.KeyboardState
These files have been obtained from the tutorials and examples mentioned at [https://threejs.org/docs/](https://threejs.org/docs/)

The obj model for car, van and pokemon have been obtained from [https://www.cgtrader.com/](https://www.cgtrader.com/)

Physics and CollisionDetection have been calculated on my own, no external libraries were used for the same.

---

# Description 

The game uses arrow keys for the movement of the pokemon - *Bulbasaur*, in forward-backward direction or sideways. It hops as it moves one step at a time. Whenever it collides with a vehicle, it respawns to it's starting point and the player loses 1 of 3 lives. When it dives into the water it loses life. Whenever the player passes a lane it is awarded with 10 points. The game ends as the pokemon successfully crosses the road and then the water stream and arrives the other side.

You can always switch between the first person and the top view by pressing P and T keys respectively.

---

# Screencast

![Image](https://rachit491.github.io/cgProj/models/thumbnail.png)

[https://youtu.be/ix56tCjjuLA](https://youtu.be/ix56tCjjuLA)

---

The tasks completed in this assignment are - 
1. Part 1: create the playing field and frog
2. Part 2: add motion to the playing field
3. Part 3: add motion to the frog
4. Part 4: add interaction between frog and field

The game also features - 
1. Track and display score. You can choose any scoring scale you want.
2. First person Frogger. As the frog moves, a perspective camera moves with it.
3. Add at least one additional vehicle (e.g. truck) or creature (e.g. turtle). Ensure that its behavior differs from other vehicles or creatures (e.g. speed or diving). - Added two 3d models, car and a van with different speed as others
4. Sound and music. On certain game events, e.g. game start, movement, collision, etc. play a sound effect. Some sounds are here and here, but feel free to use your own.


> When you win or the game is over you need to reload the page in order to start a new game
