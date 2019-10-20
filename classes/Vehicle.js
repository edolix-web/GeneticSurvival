class Vehicle {
	constructor(x, y, dna, exp) {
		this.age = 0;
		this.mutationRate = 0.01;
		this.mutationForce = 0.1;
		if (x != null) {
			this.x = x;
		} else {
			this.x = random(width);
		}
		if (y != null) {
			this.y = y;
		} else {
			this.y = random(height);
		}
		this.acceleration = createVector(0, 0);
		this.velocity = createVector(0, -2);
		this.position = createVector(this.x, this.y);
		this.r = 6;
		this.maxspeed = 3;
		this.maxforce = 0.2;
		this.initialMaxspeed = 3;
		this.initialMaxforce = 0.2;
		this.eatRadius = 5;
		if (dna != null) {
			if (random(1) < this.mutationRate) {
				dna[0] += dna[0] * (this.mutationForce * round(random(-1, 1)));
			}
			if (random(1) < this.mutationRate) {
				dna[1] += dna[1] * (this.mutationForce * round(random(-1, 1)));
			}
			if (random(1) < this.mutationRate) {
				dna[2] += dna[2] * (this.mutationForce * round(random(-1, 1)));
			}
			if (random(1) < this.mutationRate) {
				dna[3] += dna[3] * (this.mutationForce * round(random(-1, 1)));
			}
			this.dna = dna;
		} else {
			this.dna = [random(-2, 2), random(-2, 2), random(40, 200), random(40, 200)];
		}
		this.health = 1;
		this.foodNutrition = 0.2;
		this.poisonNutrition = -0.5;
		this.exp = 0;
		if (exp != null) {
			this.exp = exp;
		}
	}

	// Method to update location
	update() {
		// Update velocity
		this.velocity.add(this.acceleration);
		// Limit speed
		this.velocity.limit(this.maxspeed);
		this.position.add(this.velocity);
		// Reset accelerationelertion to 0 each cycle
		this.acceleration.mult(0);
	}

	applyBehaviors(vehicles, seekForce) {

		var separateForce = this.separate(vehicles);

		separateForce.mult(slider1.value());
		seekForce.mult(slider2.value());

		this.applyForce(separateForce);
		this.applyForce(seekForce);
	}

	applyForce(force) {
		// Mass could be added here A = F / M
		this.acceleration.add(force);
	}

	// A method that calculates a steering force towards a target
	// STEER = DESIRED MINUS VELOCITY
	seek(target) {
		let desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target

		// Normalize desired and scale to maximum speed
		desired.normalize();
		desired.mult(this.maxspeed);
		// Steering = Desired minus velocity
		let steer = p5.Vector.sub(desired, this.velocity);
		steer.limit(this.maxforce); // Limit to maximum steering force
		return steer;
	}

	// A method that calculates a steering force towards a target
	// STEER = DESIRED MINUS VELOCITY
	arrive(target) {
		var desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
		var d = desired.mag();
		// Scale with arbitrary damping within 100 pixels
		if (d < 100) {
			var m = map(d, 0, 100, 0, this.maxspeed);
			desired.setMag(m);
		} else {
			desired.setMag(this.maxspeed);
		}

		// Steering = Desired minus Velocity
		var steer = p5.Vector.sub(desired, this.velocity);
		steer.limit(this.maxforce);  // Limit to maximum steering force
		this.applyForce(steer);
	}

	// Separation
	// Method checks for nearby vehicles and steers away
	separate(vehicles) {
		var sum = createVector();
		var count = 0;
		// For every boid in the system, check if it's too close
		for (var i = 0; i < vehicles.length; i++) {
			var d = p5.Vector.dist(this.position, vehicles[i].position);
			// If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
			if ((d > 0) && (d < desiredseparation)) {
				// Calculate vector pointing away from neighbor
				var diff = p5.Vector.sub(this.position, vehicles[i].position);
				diff.normalize();
				diff.div(d); // Weight by distance
				sum.add(diff);
				count++; // Keep track of how many
			}
		}
		// Average -- divide by how many
		if (count > 0) {
			sum.div(count);
			// Our desired vector is the average scaled to maximum speed
			sum.normalize();
			sum.mult(this.maxspeed);
			// Implement Reynolds: Steering = Desired - Velocity
			sum.sub(this.velocity);
			sum.limit(this.maxforce);
		}
		return sum;
	}

	boundaries() {

		var desired = null;

		if (this.position.x < this.maxspeed) {
			desired = createVector(this.maxspeed, this.velocity.y);
		} else if (this.position.x > width - this.maxspeed) {
			desired = createVector(-this.maxspeed, this.velocity.y);
		}

		if (this.position.y < this.maxspeed) {
			desired = createVector(this.velocity.x, this.maxspeed);
		} else if (this.position.y > height - this.maxspeed) {
			desired = createVector(this.velocity.x, -this.maxspeed);
		}

		if (desired !== null) {
			desired.normalize();
			desired.mult(this.maxspeed);
			var steer = p5.Vector.sub(desired, this.velocity);
			steer.limit(this.maxforce);
			this.applyForce(steer);
		}
	}

	display() {
		// Draw a triangle rotated in the direction of velocity
		var angle = this.velocity.heading() + PI / 2;
		push();
		translate(this.position.x, this.position.y);
		rotate(angle);
		noFill();
		stroke(0, 255, 0);
		ellipse(0, 0, this.dna[2], this.dna[2]);
		line(1, 0, 1, -this.dna[0] * 40);
		stroke(255, 0, 0);
		ellipse(0, 0, this.dna[3], this.dna[3]);
		line(-1, 0, -1, -this.dna[1] * 40);
		beginShape();
		fill(lerpColor(color(255, 0, 0), color(0, 255, 0), this.health));
		stroke(200);
		strokeWeight(1);
		vertex(0, -this.r * 2);
		vertex(-this.r, this.r * 2);
		vertex(this.r, this.r * 2);
		endShape(CLOSE);
		pop();
	}

	getClosest(list, good) {
		var record = Infinity;
		var closest = null;
		var eaten = -1;
		for (let i = 0; i < list.length; i++) {
			var d = dist(this.position.x, this.position.y, list[i].x, list[i].y);
			if (good && d <= this.dna[2] || !good && d <= this.dna[3]) {
				if (d < this.eatRadius) {
					eaten = i;
				} else {
					if (d < record) {
						record = d;
						closest = list[i];
					}
				}
			}
		}

		if (eaten != -1) {
			list.splice(eaten, 1);
			list.push(createVector(random(width), random(height)));
			if (good) {
				this.health += this.foodNutrition;
				if (this.health > 1) {
					this.exp += this.health - 1;
					this.health = 1;
				}
				this.maxspeed = this.initialMaxspeed + floor(this.exp) * (1.5 * this.initialMaxspeed);
				this.maxforce = this.initialMaxforce + floor(this.exp) * (2 * this.initialMaxforce);
			} else {
				this.health += this.poisonNutrition;
			}
		}
		if (closest != null) {
			this.drawTargetLine(closest, good);
		}
		return closest;
	}

	drawTargetLine(target, good) {
		if (good) {
			stroke(0, 255, 0, 100);
		} else {
			stroke(255, 0, 0, 100);
		}
		line(this.position.x, this.position.y, target.x, target.y);
	}

	eat(list) {
		var record = Infinity;
		var closest = -1;
		for (let i = 0; i < list.length; i++) {
			var d = dist(this.position.x, this.position.y, list[i].x, list[i].y);
			if (d < record) {
				record = d;
				closest = i;
			}
		}

		var currentTarget = food[closest];

		if (record < 5) {
			list.splice(closest, 1);
		} else if (closest != null && currentTarget != null) {
			return this.seek(currentTarget);
		}

		return null;
	}

	reproduce() {
		return new Vehicle(this.position.x, this.position.y, this.dna, this.exp);
	}
}