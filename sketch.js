var vehicles = [];
var vehicleCount = 1;
var desiredseparation = 100;
var slider1;
var slider2;

var foodCount = 30;
var poisonCount = 10;
var food = [];
var poison = [];
var healthLoss = -0.005;
var reproductionRate = 0.001;
var foodGrowRate = 0.02;
var posionGrowRate = 0.001;

var maxAge = 0;
var maxAgeP = 0;
var currentMaxAge;
var currentMaxAgeP;

var maxExp = 0;
var maxExpP = 0;
var currentMaxExp;
var currentMaxExpP;

function setup() {
	maxAgeP = createP('max age: ' + maxAge);
	currentMaxAgeP = createP('current max age: ' + currentMaxAge);
	maxExpP = createP('max exp: ' + maxExp);
	currentMaxExpP = createP('current max exp: ' + currentMaxExp);
	slider1 = createSlider(0, 8, 1);
	slider2 = createSlider(0, 8, 1);
	createCanvas(800, 600);
	for (let i = 0; i < vehicleCount; i++) {
		vehicles.push(new Vehicle());
	}

	for (let i = 0; i < foodCount; i++) {
		food.push(createVector(random(width), random(height)));
	}

	for (let i = 0; i < poisonCount; i++) {
		poison.push(createVector(random(width), random(height)));
	}
}

function draw() {
	if (vehicles.length == 0) {
		vehicles.push(new Vehicle());
	}
	background(51);

	// if (random(1) < foodGrowRate) {
	// 	food.push(createVector(random(width), random(height)));
	// }

	// if (random(1) < posionGrowRate) {
	// 	poison.push(createVector(random(width), random(height)));
	// }

	food.forEach(item => {
		fill(0, 255, 0);
		noStroke();
		ellipse(item.x, item.y, 8, 8);
	});

	poison.forEach(item => {
		fill(255, 0, 0);
		noStroke();
		ellipse(item.x, item.y, 8, 8);
	});

	for (let i = vehicles.length - 1; i >= 0; i--) {
		var vehicle = vehicles[i];
		vehicle.age++;
		if (maxAge < vehicle.age) {
			maxAge = vehicle.age;
		}
		if (currentMaxAge < vehicle.age) {
			currentMaxAge = vehicle.age;
		}
		if (maxExp < vehicle.exp) {
			maxExp = vehicle.exp;
		}
		if (currentMaxExp < vehicle.exp) {
			currentMaxExp = vehicle.exp;
		}
		if (random(1) < reproductionRate) {
			var newVehicle = vehicle.reproduce();
			vehicles.push(newVehicle);
		}
		if (vehicle.health <= 0) {
			currentMaxAge = 0;
			currentMaxExp = 0;
			vehicles.splice(i, 1);
			// food.push(createVector(vehicle.position.x, vehicle.position.y));
		} else {
			vehicle.health += healthLoss;
			var nextFood = vehicle.getClosest(food, true);
			var nextPoison = vehicle.getClosest(poison, false);

			if (nextFood != null) {
				var foodSteer = vehicle.seek(nextFood);
			}
			if (nextPoison != null) {
				var poisonSteer = vehicle.seek(nextPoison);
			}

			if (foodSteer) {
				foodSteer.mult(vehicle.dna[0]);
				vehicle.applyBehaviors(vehicles, foodSteer);
			}
			if (poisonSteer) {
				poisonSteer.mult(vehicle.dna[1]);
				vehicle.applyBehaviors(vehicles, poisonSteer);
			}
			vehicle.boundaries();
			vehicle.update();
			vehicle.display();
		}
	}
	maxAgeP.html('max age: ' + maxAge);
	currentMaxAgeP.html('current max age: ' + currentMaxAge);
	maxExpP.html('max exp: ' + maxExp);
	currentMaxExpP.html('current max exp: ' + currentMaxExp);
}