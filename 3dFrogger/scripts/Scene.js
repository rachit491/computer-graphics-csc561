/**
 *	Frogger.Scene.js
 *	@author Rachit Shrivastava
 */

var camera, controls, scene, renderer, id, factory, keyboard, player, collisionDetector;
var cameraOldPos, playerOldPos, side;
var sound = [];

var xLimits = [52.5, 160];
var yLimits = [2.5, 8];	//jump limits
var yLimitsWater = [6.5, 12];	//jump limits
var zLimits = [-50, 50];

var lookAtScene = true, perspectiveCamera = true;

//Physics
var onGround = false;
var jumped = false;
var gravity = 0.5;
var speed = { x: 5.0, y: 0.0, z: 0.8, hx: 5.0, hy: 0.0, hz: 1.0 };

function init() {

	setupCamera();

	// world

	scene = new THREE.Scene();
	factory = new Factory(scene);
	collisionDetector = new CollisionDetector();
	keyboard = new THREEx.KeyboardState();

	factory.createBase();
	factory.createVehicles();
	factory.createWoodenLogs();
	factory.createPlayer();

	// renderer

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor(0x000000);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.domElement.id = 'frogger';

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;

	var container = document.getElementById('container');
	container.appendChild(renderer.domElement);

	window.addEventListener('resize', onWindowResize, false);

	// lights

	light = new THREE.DirectionalLight(0xffffff);
	light.position.set(100, 100, -100);
	light.target.position.set(0, 0, 0);
	light.castShadow = true;
	light.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(120, 1, 1, 1000));
	light.shadow.bias = 0.00001;
	light.shadow.mapSize.width = 2048 * 2;
	light.shadow.mapSize.height = 2048 * 2;
	scene.add(light);

	light = new THREE.DirectionalLight(0xffffff);//0x002288
	light.position.set(-100, 100, -100);
	light.target.position.set(0, 0, 0);
	scene.add(light);

	light = new THREE.AmbientLight(0x222222); 
	scene.add(light);

	initAudio();
	playAudio("backgroundLoop", true);

	render();
	animate();
}

//check window resize options
function onWindowResize() {
	camera.setSize(window.innerWidth, window.innerHeight);
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	render();
}
	
//starting the request frame animation function here
function animate() {
	id = requestAnimationFrame(animate);
	render();
	moveVehicles();
	factory.moveCar();
	factory.moveVan();
}

//renderer
function render() {
	player = scene.getObjectByName("pokemon");
	if(player != undefined) {
		checkKeyboard();
		//player = factory.getPokemon();	

	speed.y -= gravity;
	player.position.y += speed.y;
	
	if(player.position.y < yLimits[0]) {
		player.position.y = yLimits[0];	
		speed.y = 0.0;
		onGround = true;
		detectCollision();
		factory.carCollisionDetector(collisionDetector);
		factory.vanCollisionDetector(collisionDetector);
		jumped = false;
	}

	if(player.position.y >= yLimits[1]) {
		if(jumped) {
			endJump();
		}
	}

	//jump speed for water area
	if(player.position.x <= 102.5) {
		speed.x = 10.0;
	} else {
		speed.x = 5.0;
		yLimits[0] = 2.5;
		yLimits[1] = 8;
	}

	if(player.position.x <= 52.5) {
		//you win
		window.setTimeout(function() {
			cancelAnimationFrame(id);
			document.getElementById("gameOver").innerHTML = "YOU WIN...";
			document.getElementById("gameOver").style.display = "block";
			console.warn("You Win");

			stopAudio("backgroundLoop");
			playAudio("win", false);
		}, 800);
	}
	
	if(lookAtScene)
		camera.lookAt(scene.position);
	
	renderer.render(scene, camera);
}
}

//initialise audio files
function initAudio() {
	sound.push(new Audio("./sounds/frogger-music.mp3"));				//backgroundLoop
	sound.push(new Audio("./sounds/sound-frogger-hop.wav"));			//jump
	sound.push(new Audio("./sounds/frogger-gameover.mp3"));				//gameOver
	sound.push(new Audio("./sounds/sound-frogger-squash.wav"));			//crash
	sound.push(new Audio("./sounds/sound-frogger-plunk.wav"));			//plunk
	sound.push(new Audio("./sounds/dp_frogger_extra.wav"));				//you win
}

//function to play specific audio files
function playAudio(name, loop) {
	switch(name) {
		case "backgroundLoop": sound[0].loop = loop; sound[0].play(); break;
		case "jump": sound[1].play(); break;
		case "gameOver": sound[2].play(); break;
		case "crash": sound[3].play(); break;
		case "plunk": sound[4].play(); break;
		case "win": sound[5].play(); break;
	}
}

//function to stop specific audio files
function stopAudio(name) {
	switch(name) {
		case "backgroundLoop": sound[0].pause(); sound.currentTime = 0; break;
		case "jump": sound[1].pause(); break;
		case "gameOver": sound[2].pause(); break;
		case "crash": sound[3].pause(); break;
		case "plunk": sound[4].pause(); break;
		case "win": sound[5].pause(); break;
	}
}

//function to move vehicles in space
function moveVehicles() {

	var vehicles = factory.getVehicles();

	for(var i = 0; i < vehicles.length; i++) {
		if(vehicles[i].lane == 0) 
			vehicles[i].mesh.position.z += 1.2;
		else if(vehicles[i].lane % 2 == 0)
			vehicles[i].mesh.position.z += 0.8;
		else
			vehicles[i].mesh.position.z -= 0.3;

		if(vehicles[i].mesh.position.z > 50) {
			vehicles[i].mesh.position.z = -50;
		} else if(vehicles[i].mesh.position.z < -50) {
			vehicles[i].mesh.position.z = 50;
		}
	}

	var woodenLogs = factory.getWoodenLogs();

	for(var i = 0; i < woodenLogs.length; i++) {
		if(woodenLogs[i].lane % 2 == 0)
			woodenLogs[i].mesh.position.z -= 0.2;
		else
			woodenLogs[i].mesh.position.z += 0.5;

		if(woodenLogs[i].mesh.position.z > 50) {
			woodenLogs[i].mesh.position.z = -50;
		} else if(woodenLogs[i].mesh.position.z < -50) {
			woodenLogs[i].mesh.position.z = 50;
		}
	}

}

//check collision and display result accordingly on scoreboard
function detectCollision() {
	var woodenLogs = factory.getWoodenLogs();
	var vehicles = factory.getVehicles();

	collisionDetector.setObjects(vehicles, woodenLogs, player);
 	var collision = collisionDetector.checkCollision(perspectiveCamera);
	if(collision.collided) {
		//console.log(collisionDetector.checkCollision(perspectiveCamera).object);
		switch(collision.object) {
			case "logs" :
			case "water" : playAudio("plunk", false); break;
			case "vehicles" : playAudio("crash", false); break;
			case "none" : break;
		}
		var lives = document.getElementById("rem").innerHTML;
		lives--;
		document.getElementById("rem").innerHTML = (lives < 0) ? 0: lives;
		if(lives > 0) {
			reset();
		}
		else {
			window.setTimeout(function() {
				cancelAnimationFrame(id);
				document.getElementById("gameOver").innerHTML = "GAME OVER!";
				document.getElementById("gameOver").style.display = "block";
				console.warn("GameOver");

				stopAudio("backgroundLoop");
				playAudio("gameOver", false);
			}, 150);
		}
	}

	else {
		if(jumped && (side == "up" || side == "down")) {
			var score = document.getElementById("scoreno").innerHTML;
			score = parseInt(score);
			score += 10;
			document.getElementById("scoreno").innerHTML = score;
		}
	}
}

// check for keyboard inputs
//left, right, up, down keys to move the player and camera along
function checkKeyboard() {

	if(keyboard.pressed("right") && player.position.z > zLimits[0]) {
		if(onGround)
			player.position.z -= speed.hx;
		startJump("right");
		if(perspectiveCamera)
			camera.position.z -= speed.hz;
	}

	if(keyboard.pressed("left") && player.position.z <= zLimits[1]) {
		if(onGround)
			player.position.z += speed.hx;
		startJump("left");
		if(perspectiveCamera)
			camera.position.z += speed.hz;
	}

	if(keyboard.pressed("up") && player.position.x > xLimits[0]) {
		if(onGround)
			player.position.x -= speed.x;
		startJump("up");
		//console.log(player.position.x);
		if(perspectiveCamera)
			camera.position.x -= speed.z;
	}

	if(keyboard.pressed("down") && player.position.x <= xLimits[1]) {
		if(onGround)
			player.position.x += speed.x;
		startJump("down");
		if(perspectiveCamera)
			camera.position.x += speed.z;
	}

	if(keyboard.pressed("T")) {
		//to get the orthographic top view
		setupOrthographicCamera();
	}

	if(keyboard.pressed("P")) {
		//to get the perspective view
		setupPerspectiveCamera();
	}
}

function setupPerspectiveCamera() {
	perspectiveCamera = true;
	camera.toPerspective();
	camera.setFov(45);

	camera.position.set(
		cameraOldPos.x + (player.position.x - playerOldPos.x), 
		cameraOldPos.y + (player.position.y - playerOldPos.y), 
		cameraOldPos.z + (player.position.z - playerOldPos.z)
	);
	scene.rotation.y = 0;

	lookAtScene = true;
}

function setupCamera() {
	camera = new THREE.CombinedCamera(window.innerWidth, window.innerHeight, 45, 1, 1000, 1, 1000);
	camera.position.set(200, 15, 0);
}

function setupOrthographicCamera() {
	if(perspectiveCamera) {
		cameraOldPos = {x: camera.position.x, y: camera.position.y, z: camera.position.z};
		playerOldPos = {x: player.position.x, y: player.position.y, z: player.position.z};
	}
	perspectiveCamera = false;
	camera.toOrthographic();
	camera.toTopView();
	camera.setFov(15);
	camera.position.set(0, 15, 105);
	scene.rotation.y = 270 * Math.PI/180;
	
	lookAtScene = false;
}

function startJump(name) {
    if(onGround && !jumped) {
    	playAudio("jump", false);
        speed.y = 2.0;
        side = name;
        onGround = false;
        jumped = true;
    }
}

function endJump() {
    if(speed.y < 1.0) {
        speed.y = 1.0;
    }
}

function reset() {
	setupCamera();
	player.position.set(162.5, 5, 0);
	if(perspectiveCamera) {
		
	}
	else {
		setupOrthographicCamera();
	}
}