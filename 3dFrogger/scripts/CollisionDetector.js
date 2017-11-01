/**
 *	Frogger.CollisionDetector.js
 *	@author Rachit Shrivastava
 */

function CollisionDetector() {
	
	this.vehicles = [];
	this.woodenLogs = [];

	this.setObjects = function(vehicles, woodenLogs, player) {
		this.playerObject = player;
		this.player = new THREE.Box3().setFromObject(player);

		for(var i=0; i<vehicles.length; i++) {
			this.vehicles[i] = { box: new THREE.Box3().setFromObject(vehicles[i].mesh), lane: vehicles[i].lane };
		}
		
		for(var i=0; i<woodenLogs.length; i++) {
			this.woodenLogs[i] = { box: new THREE.Box3().setFromObject(woodenLogs[i].mesh), lane: woodenLogs[i].lane };
		}

	}

	this.setCarObject = function(car) {
		this.carObject = car;
		this.car = new THREE.Box3().setFromObject(car);
	}

	this.checkCarCollision = function() {
		if(this.player.intersectsBox(this.car)) {
			return { collided: true, object: "vehicles" };
		}

		return { collided: false, object: "none" };
	}

	this.setVanObject = function(van) {
		this.vanObject = van;
		this.van = new THREE.Box3().setFromObject(van);
	}

	this.checkVanCollision = function() {
		if(this.player.intersectsBox(this.van)) {
			return { collided: true, object: "vehicles" };
		}

		return { collided: false, object: "none" };
	}

	this.checkCollision = function(perspectiveCamera) {
		var i;
		var pPos = this.player.getCenter();
		var pos = perspectiveCamera ? pPos.x : pPos.z;
		//console.log(pos);
		var found = false;
		if(pos < 95 && pos > 53) {
			count = 0;
			for(i=0; i<this.woodenLogs.length; i++) {
				if(this.player.intersectsBox(this.woodenLogs[i].box)) {
					//mve the player as per logs speed and direction
					found = true;
					
					if(this.woodenLogs[i].lane % 2 == 0) {
						this.playerObject.position.z -= 0.2;
					}
					else {
						this.playerObject.position.z += 0.5;
					}

					if(this.playerObject.position.z > 45 || this.playerObject.position.z < -45)
						return { collided: true, object: "logs" };

					return { collided: false, object: "logs" };
				}	
				else {
					count++;
				}			
			}
			if(count == this.woodenLogs.length) {
				//reset player position - in water
				return { collided: true, object: "water" };
			}
		}
		else {
			for(i=0; i<this.vehicles.length; i++) {
				if(this.player.intersectsBox(this.vehicles[i].box)) {
					//play death animation
					return { collided: true, object: "vehicles" };
				}
			}
		}
		
		return { collided: false, object: "none" };
	}
}