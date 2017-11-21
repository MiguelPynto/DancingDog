/*
42094 Beatriz Lalanda
42066 Pedro Pinto
codigo inicial de AMD/2014

using Java Code Convention

private repository
https://Pynto@bitbucket.org/Pynto/dancingdog.git

*/



// GLOBAL CONSTANTS

const MAX_ACTORS = 460;

const WORLD_WIDTH = 31;
const WORLD_HEIGHT = 18;

const MIN_LIVES = 1;
const MAX_LIVES = 10;
const DEFAULT_LIVES = 1;

const MIN_CRABS = 1;
const MAX_CRABS = MAX_ACTORS;
const DEFAULT_CRABS = 5;
const KID_CRABS = 1;
const EASY_CRABS = 2;
const HARD_CRABS = 10;
const IMPOSSIBLE_CRABS = 2;

const MIN_BOWLS = 0;
const MAX_BOWLS = MAX_ACTORS;
const DEFAULT_BOWLS = 120;
const KID_BOWLS = 100;
const EASY_BOWLS = 220;
const HARD_BOWLS = 100;
const IMPOSSIBLE_BOWLS = 7;

const MIN_CATS = 0;
const MAX_CATS = MAX_ACTORS;
const DEFAULT_CATS = 0;
const KID_CATS = 3;
const EASY_CATS = 1;
const HARD_CATS = 0;
const IMPOSSIBLE_CATS = 0;

const MIN_ROCKS = 0;
const MAX_ROCKS = MAX_ACTORS;
const DEFAULT_ROCKS = 0;
const KID_ROCKS = 100;
const EASY_ROCKS = 20;
const HARD_ROCKS = 20;
const IMPOSSIBLE_ROCKS = 0;

const MIN_SPEED = 0;
const MAX_SPEED = 10;
const DEFAULT_CRAB_SPEED = 4;
const DEFAULT_CAT_SPEED = 9;
const KID_CRAB_SPEED = 0;
const KID_CAT_SPEED = 5;
const EASY_CRAB_SPEED = 2;
const EASY_CAT_SPEED = 7;
const HARD_CRAB_SPEED = 6;
const HARD_CAT_SPEED = 9;
const IMPOSSIBLE_CRAB_SPEED = 8;
const IMPOSSIBLE_CAT_SPEED = 9;


const SINGLE_LABEL = "Single";
const COOP_LABEL = "Coop"
const RESTART_LABEL = "Restart";
const PAUSE_LABEL = "Pause";
const UNPAUSE_LABEL = "Unpause";

const ACTOR_PIXELS = 32;

const IMAGES = [];
IMAGES["dog"] = "img/dog.jpg";
IMAGES["crab"] = "img/crab.jpg";
IMAGES["block"] = "img/block.jpg";
IMAGES["bowl"] = "img/bowl.jpg";
IMAGES["empty"] = "img/empty.jpg";
IMAGES["rock"] = "img/rock.gif"
IMAGES["cat"] = "img/cat.png"
IMAGES["sheep"] = "img/sheep.png"



// GLOBAL VARIABLES

var empty, debug;
var loaded = 0;



// GENERAL FUNCTIONS

function create(proto) { // Create object and applies init(...) to it
	function F() {}
	F.prototype = proto;
	var obj = new F();
	if (arguments.length > 1)
		obj.init.apply(obj, Array.prototype.slice.apply(arguments).slice(1));
	return obj;
}

function extend(proto, added) { // Creates new prototype that extends existing prototype
	function F() {}
	F.prototype = proto;
	var proto1 = new F();
	for (prop in added)
		proto1[prop] = added[prop];
	return proto1;
}

function rand(n) {
	return Math.floor(Math.random() * n);
}

function distance(x1, y1, x2, y2) {
	var dx = Math.abs(x1 - x2);
	var dy = Math.abs(y1 - y2);
	return Math.ceil(Math.sqrt(dx*dx + dy*dy));
}

function getEmptyCoordinates() {		
		var n = rand(game.setup.nEmpty); //n-esima casa vazia
		var acc = 0; // numero de casas vazias nas colunas anteriores
		var x = 0;
		while (n > acc) { // a n-esima casa vazia esta numa coluna mais a frente
			x++;
			acc += game.setup.empty[x];
		}
		while (game.setup.empty[x] == 0) // pode haver colunas sem casas vazias
			x++;
		var y = rand(WORLD_HEIGHT - 1); // linha random nessa coluna
		if (game.world[x][y] == empty)
			return {x: x, y: y};
		else // casa ocupada . encontrar outra linha nessa coluna
			for (var y = 0; y < WORLD_HEIGHT; y++){
				if (game.world[x][y] == empty)
					return {x: x, y: y};
		return {x: -1, y: -1};
	}
}

function getSurroundCoordinates(x, y) {
	var surround = [];
	for (var dx = -1; dx <= 1; dx++)
		for (var dy = -1; dy <= 1; dy++)
			surround.push({x: x+dx, y: y+dy});
	return surround;
}

function createArray(x, y, value) {
	var ax = new Array(x);
	for (var i = 0; i < x; i++) {
		var axy = new Array(y);
		for (var j = 0; j < y; j++)
			axy[j] = value;
		ax[i] = axy;
	}
	return ax;
}

function showDebug(distances) {
	for (var x in game.world)
		for (var y in game.world[x])
			if (game.world[x][y] == empty)
				gui.ctx.drawImage(empty.image, x * ACTOR_PIXELS, y * ACTOR_PIXELS);

	gui.ctx.font = "14px Arial";
	gui.ctx.fillStyle = "blue";
	for (var x in distances)
		for (var y in distances[x])
			if (distances[x][y] != undefined)
				gui.ctx.fillText(distances[x][y], x * ACTOR_PIXELS + 8, y * ACTOR_PIXELS + 18);
}



// ACTOR PROTOTYPES

var Empty = {
	image: null
}

var Character = extend(Empty, {
	x: 0, y: 0, // posicao
	strength: 0, // forca para empurrar
	weight: 0, // peso para ser empurrado

	init: function(x, y) {
		this.x = x;
		this.y = y;
		this.show();
	},

	show: function() {
		game.world[this.x][this.y] = this;
		gui.ctx.drawImage(this.image, this.x * ACTOR_PIXELS, this.y * ACTOR_PIXELS);
	},

	hide: function() {
		game.world[this.x][this.y] = empty;
		gui.ctx.drawImage(empty.image, this.x * ACTOR_PIXELS, this.y * ACTOR_PIXELS);
	},

	canGo: function(x, y) {
		var other = game.world[x][y];
		if (other == empty || this.strength > other.weight) // mais forte
			return true;
		return false;
	},

	go: function(x, y) {
		this.hide();
		this.x = x;
		this.y = y;
		this.show();
	},

	move: function(dx, dy) {
		var nx = this.x + dx;
		var ny = this.y + dy;
		var other = game.world[nx][ny];
		if (other == empty)
			this.go(nx, ny);
		else if (this.strength > other.weight)
			this.pushes(dx, dy);
	},

	pushes: function(dx, dy) {
		var nx = this.x + dx; // posicao seguinte
		var ny = this.y + dy;
		var other = game.world[nx][ny]; // objecto que está nessa posicao
		if (other == undefined)
			return false;

		if (other == empty) {
			this.go(nx, ny); // este é para ser o move definitivo, o mover mesmo
			return true;
		}
		if (this.strength > other.weight) { // pode empurrar
			var strength = other.strength;
			other.strength = this.strength; // temporariamente o outro tem também a força deste
			
			if (other.pushes(dx, dy)) { // se o outro se mexeu
				this.go(nx, ny); // mexe também  este
				other.strength = strength; // o outro volta a ter a força que tinha
				return true;
			}
		}
		return false;
	},

	respawn: function() {
		do
			var coord = getEmptyCoordinates();
		while (coord.x == -1);
		this.go(coord.x, coord.y);
	},
}); //todo um personagem q se te apanha, faz respawn às tigelas todas (mas nao tira vida)


var Block = extend(Character, {
	weight: 99,
})

var Bowl = extend(Character, {
	weight: 10,
})

var Rock = extend(Character, {
	weight: 20,
})

var AliveCharacter = extend(Character, {
	foodChain: 0,

	canGo: function(x, y) {
		var other = game.world[x][y];
		if (this.foodChain > other.foodChain || this.foodChain < other.foodChain)
			return true;
		return Character.canGo.call(this, x, y);
	},

	move: function(dx, dy) {
		var x = this.x + dx;
		var y = this.y + dy;
		var other = game.world[x][y];
		if (this.foodChain < other.foodChain)
			this.die();
		else if (this.foodChain > other.foodChain) {
			other.die();
			this.go(x, y); //todo bug 2 vidas, dog desaparece
		}
		else
			Character.move.call(this, dx, dy);
	},
})


var NonPlayableCharacter = extend(AliveCharacter, {
	stalker: true,
	speed: 0,

	animation: function(distances) {
		var dx = 0;
		var dy = 0;
		var record;
		var surround = getSurroundCoordinates(this.x, this.y);
		for (var i in surround) {
			var x = surround[i].x;
			var y = surround[i].y;
			var d = distances[x][y];
			if (d != undefined && this.canGo(x, y)) // if can go
				if ((record == undefined) || // first loop
				((this.stalker && d < record) || (!this.stalker && d > record)) || // new record
				(d == record && (this.x == x || this.y == y))) { // same record, preference perpendicular
					record = d;
					dx = x - this.x;
					dy = y - this.y;
				}
		}
		this.move(dx, dy);
	},

	isBlocked: function() {
		var surround = getSurroundCoordinates(this.x, this.y);
		for (var i in surround) {
			var coord = surround[i];
			if (this.canGo(coord.x, coord.y))
				return false;
		}
		return true;
	},
})

var Crab = extend(NonPlayableCharacter, { //todo carang mata gato?
	weight: 100,
	foodChain: 3,
	minDist: 5,
})

var Cat = extend(NonPlayableCharacter, {
	weight : 100,
	foodChain: 1,
	stalker: false,

	die: function() {
		game.winLife();
		this.hide();
		game.setup.destroyCat(this);
	},
})


var PlayableCharacter = extend(AliveCharacter, {

	die: function() {
		game.loseLife();
		if (game.lives == 0) {
			this.hide();
			game.gameOver();
		}
		else
			this.respawn();
	},

	calcDistances: function() {
		var distances = createArray(WORLD_WIDTH, WORLD_HEIGHT);
		var d = 0;
		distances[this.x][this.y] = d;
		while (true) {
			d++;
			var found = false;
			for (var x = 0; x < WORLD_WIDTH; x++)
				for (var y = 0; y < WORLD_HEIGHT; y++)
					if (distances[x][y] == d - 1) { // todo algures aqui calc distance(xyxy)
						found = true;
						var surround = getSurroundCoordinates(x, y);
						for (var i in surround) {
							var sx = surround[i].x;
							var sy = surround[i].y;
							if (distances[sx][sy] == undefined && game.world[sx][sy] == empty) // todo type
								distances[sx][sy] = d;
						}
					}
			if (!found)
				break;
		}
		return distances;
	},
})

var Dog = extend(PlayableCharacter, {
	strength: 25,
	weight: 25,
	foodChain: 2,
})

var Sheep = extend(PlayableCharacter, {
	strength: 12,
	weight: 25,
	foodChain: 2,
})



// GLOBAL OBJECTS

var game = {
	dtime: 0, // double seconds
	world: [], // array[x][y]
	players: [], // controled players
	crabs: [], // npc crabs
	cats: [], // npc cats
	hiscore: undefined, // win record seconds
	lives: 1, // player global lives

	// GENERAL FUNCTIONS

	load: function() {
		gui.showReport("Loading...");
		empty = create(Empty);
		this.loader.images();
		this.loader.events();
	},

	start: function(settings) {
		if (this.animations.running)
			this.animations.stop();
		this.setup.destroyWorld();
		gui.hideWelcome();
		gui.hideReport();

		this.setup.createWorld(settings);
		gui.setLives(game.lives);
		gui.setTime(game.dtime);
		this.animations.start();
	},

	pause: function() {
		this.animations.pause();
		gui.showReport("Crabs Are Waiting...");
	},

	unpause: function() {
		gui.hideReport();
		this.animations.start();
	},

	loseLife: function() {
		this.lives--;
		gui.setLives(this.lives);
	},

	winLife: function() {
		this.lives++;
		gui.setLives(this.lives);
	},

	win: function() {
		this.animations.stop();
		var t = Math.floor(game.dtime / 2);
		gui.showReport("Won in " + t + " seconds!");
		if (game.hiscore == undefined || t < game.hiscore) {
			game.hiscore = t;
			gui.setHiscore(t);
		}
		gui.disablePause();
	},

	gameOver: function() {
		this.animations.stop();
		gui.showReport("GameOver");
		gui.disablePause();
	},

	// LOAD OBJ FUNCTIONS

	loader: {

		images: function() {
			Dog.image = this.img(IMAGES["dog"]);
			Crab.image = this.img(IMAGES["crab"]);
			Block.image = this.img(IMAGES["block"]);
			Bowl.image = this.img(IMAGES["bowl"]);
			Empty.image = this.img(IMAGES["empty"]);
			Cat.image = this.img(IMAGES["cat"]);
			Sheep.image = this.img(IMAGES["sheep"]);
			Rock.image = this.img(IMAGES["rock"]);
		},

		img: function(src) {
			var image = new Image();
			image.src = src;
			image.onload = function() {
				loaded++;
				if (loaded >= Object.keys(IMAGES).length) {
					gui.hideReport();
					gui.showWelcome();
					gui.enableSingle();
					gui.enableCoop();
				}
			};
			return image;
		},

		events: function() {
			document.addEventListener("keydown", keyEvent, false);
		}

	},

	// SETUP OBJ FUNCTIONS

	setup: {
		empty: 0,
		nEmpty: 0,

		createWorld: function(settings) {
			game.dtime = 0;
			game.lives = settings.lives;
			game.players = [];
			this.createEmptyWorld();
			this.createBlocks();
			this.createDog();
			if (settings.coop)
				this.createSheep();
			this.createCrabs(settings.crabs, settings.crabSpeed);
			this.createCats(settings.cats, settings.catSpeed);
			this.createBowls(settings.bowls);
			this.createRocks(settings.rocks);
		},

		createEmptyWorld: function() {
			game.world = createArray(WORLD_WIDTH, WORLD_HEIGHT, empty);
			this.empty = new Array(WORLD_WIDTH);
			for (var x = 0; x < WORLD_WIDTH; x++)
				this.empty[x] = WORLD_HEIGHT;
			this.nEmpty = WORLD_HEIGHT * WORLD_WIDTH;
		},

		createBlocks: function() {
			for (var x = 0; x < WORLD_WIDTH; x++) {
				for (var y = 0; y < WORLD_HEIGHT; y++) {
					if (x == 0 || x == WORLD_WIDTH - 1) {
						create(Block, x, y);
						this.empty[x]--;
						this.nEmpty--;
					}
					else if (y == 0 || y == WORLD_HEIGHT - 1) {
						create(Block, x, y);
						this.empty[x]--;
						this.nEmpty--;
					}
				}
			}
		},

		createDog: function() {
			var coord = getEmptyCoordinates();
			while (coord.x == -1)
				coord = getEmptyCoordinates();
			var player = create(Dog, coord.x, coord.y);
			game.players.push(player);
			this.empty[coord.x]--;
			this.nEmpty--;
		},

		createSheep: function() {
			var coord = getEmptyCoordinates();
			while (coord.x == -1)
				coord = getEmptyCoordinates();
			var player = create(Sheep, coord.x, coord.y);
			game.players.push(player);
			this.empty[coord.x]--;
			this.nEmpty--;
		},

		createCrabs: function(n, speed) {
			Crab.speed = speed;
			game.crabs = [];
			for (var i = 0; i < n; i++) {
				var coord = {x: game.players[0].x, y: game.players[0].y};
				while (distance(coord.x, coord.y, game.players[0].x, game.players[0].y) < Crab.minDist || coord.x == -1)
					coord = getEmptyCoordinates();
				game.crabs[i] = create(Crab, coord.x, coord.y);
				this.empty[coord.x]--;
				this.nEmpty--;			
			}
		},

		createCats: function(n, speed) {
			Cat.speed = speed;
			game.cats = [];
			for (var i = 0; i < n; i++) {
				var coord = getEmptyCoordinates();
				game.cats[i] = create(Cat, coord.x, coord.y);
				this.empty[coord.x]--;
				this.nEmpty--;
			}
		},

		createBowls: function(n) {
			for (var i = 0; i < n; i++) {
				var coord = getEmptyCoordinates();
				while (coord.x == -1)
					coord = getEmptyCoordinates();
				create(Bowl, coord.x, coord.y);
				this.empty[coord.x]--;
				this.nEmpty--;
			}
		},

		createRocks: function(n) {
			for (var i = 0; i < n; i++) {
				var coord = getEmptyCoordinates();
				while (coord.x == -1)
					coord = getEmptyCoordinates();
				create(Rock, coord.x, coord.y);
				this.empty[coord.x]--;
				this.nEmpty--;
			}
		},

		destroyWorld: function() {
			for (x in game.world)
				for (y in game.world[x])
					if (game.world[x][y] != empty)
						game.world[x][y].hide();
		},

		destroyCat: function(cat) {
			var i = game.cats.indexOf(cat);
			game.cats.splice(i, 1);
			if (game.cats.length == 0) {
				//todo game.animations.stop cats
				console.log("no more cats");
			}
		}
	},

	// ANIMATION OBJ FUNCTIONS

	animations: {
		running: undefined, // running animations

		start: function() {
			this.running = [];
			var i = 0;
			this.running[i++] = window.setInterval(this.timeIncrement, 500); // half second
			if (game.crabs.length > 0) {
				var ms = (MAX_SPEED + 1) * 100 - Crab.speed * 100;
				this.running[i++] = window.setInterval(this.crabChases, ms);
			}
			if (game.cats.length > 0) {
				var ms = (MAX_SPEED + 1) * 100 - Cat.speed * 100;
				this.running[i++] = window.setInterval(this.catRuns, ms);
			}
		},

		pause: function() {
			for (i in this.running)
				window.clearInterval(this.running[i]);
			this.running = false;
		},

		stop: function() {
			for (i in this.running)
				window.clearInterval(this.running[i]);
			this.running = undefined;
		},

		timeIncrement: function() {
			game.dtime++;
			gui.setTime(game.dtime);
		},

		crabChases: function() {
			var distances = game.animations.calcDistances();
			var blocked = true;
			for (var i in game.crabs)
				if (!game.crabs[i].isBlocked()) {
					game.crabs[i].animation(distances);
					blocked = false;
				}
			if (blocked)
				game.win();
		},

		catRuns: function() {
			var distances = game.animations.calcDistances();
			for (var i in game.cats)
				game.cats[i].animation(distances);
		},

		calcDistances: function() {
			var distances = createArray(WORLD_WIDTH, WORLD_HEIGHT);
			for (var i in game.players) {
				var playerDistances = game.players[i].calcDistances();
				for (var x = 0; x < WORLD_WIDTH; x++)
					for (var y = 0; y < WORLD_HEIGHT; y++)
						if (distances[x][y] == undefined || distances[x][y] > playerDistances[x][y])
							distances[x][y] = playerDistances[x][y];
			}
			if (debug)
				showDebug(distances);
			return distances;
		},
	}
}



var gui = {
	ctx: 0,
	lives: 0,
	time: 0,
	hiscore: 0,
	report: 0,
	welcome: 0,
	title: 0,
	details: 0,
	settings: 0,
	control: 0,

	init: function() {
		this.ctx = document.getElementById("playground").getContext("2d");
		this.lives = document.getElementById("lives");
		this.time = document.getElementById("time");
		this.hiscore = document.getElementById("hiscore");
		this.report = document.getElementById("playreport");
		this.welcome = document.getElementById("playwelcome");
		this.settings = document.getElementById("menusettings");
		this.control = document.getElementById("menucontrol");
	},

	setTime: function(t) {
		var msg = (t%2 ? "." : "&nbsp;") + Math.floor(t/2);
		this.time.innerHTML = msg;
	},

	setLives: function(l) {
		this.lives.innerHTML = l;
	},

	setHiscore: function(s) {
		this.hiscore.innerHTML = s;
	},

	setSettings: function() {
		this.settings.lives.min = MIN_LIVES;
		this.settings.lives.max = MAX_LIVES;
		this.settings.lives.value = DEFAULT_LIVES;
		this.settings.crabs.min = MIN_CRABS;
		this.settings.crabs.max = MAX_CRABS;
		this.settings.crabs.value = DEFAULT_CRABS;
		this.settings.bowls.min = MIN_BOWLS;
		this.settings.bowls.max = MAX_BOWLS;
		this.settings.bowls.value = DEFAULT_BOWLS;
		this.settings.cats.min = MIN_CATS;
		this.settings.cats.max = MAX_CATS;
		this.settings.cats.value = DEFAULT_CATS;
		this.settings.rocks.min = MIN_ROCKS;
		this.settings.rocks.max = MAX_ROCKS;
		this.settings.rocks.value = DEFAULT_ROCKS;
		this.settings.crabspeed.min = MIN_SPEED;
		this.settings.crabspeed.max = MAX_SPEED;
		this.settings.crabspeed.value = DEFAULT_CRAB_SPEED;
		this.settings.catspeed.min = MIN_SPEED;
		this.settings.catspeed.max = MAX_SPEED;
		this.settings.catspeed.value = DEFAULT_CAT_SPEED;
	},

	showReport: function(msg) {
		if (!debug) {
			this.report.style.visibility = "visible";
			this.report.getElementsByTagName("span")[0].innerHTML = msg;
		}
		else
			alert(msg);
	},

	hideReport: function() {
		this.report.style.visibility = "hidden";
	},

	showWelcome: function() {
		this.welcome.style.visibility = "visible";
	},

	hideWelcome: function() {
		this.welcome.style.visibility = "hidden";
	},

	getSettings: function() {
		var lives = this.settings.lives.value; // read values
		var crabs = this.settings.crabs.value;
		var bowls = this.settings.bowls.value;
		var cats = this.settings.cats.value;
		var rocks = this.settings.rocks.value;
		var crabSpeed = this.settings.crabspeed.value;
		var catSpeed = this.settings.catspeed.value;
		debug = this.settings.debug.checked;

		if (!lives || isNaN(lives) || lives < MIN_LIVES || lives > MAX_LIVES) // validate values
			this.settings.lives.value = lives = DEFAULT_LIVES; // set invalid values to default and update gui
		if (!crabs || isNaN(crabs) || crabs < MIN_CRABS || crabs > MAX_CRABS)
			this.settings.crabs.value = crabs = DEFAULT_CRABS;
		if (!bowls || isNaN(bowls) || bowls < MIN_BOWLS || bowls > MAX_BOWLS)
			this.settings.bowls.value = bowls = DEFAULT_BOWLS;
		if (!cats || isNaN(cats) || cats < MIN_CATS || cats > MAX_CATS)
			this.settings.cats.value = cats = DEFAULT_CATS;
		if(!rocks || isNaN(rocks) || rocks < MIN_ROCKS || rocks > MAX_ROCKS)
			this.settings.rocks.value = rocks = DEFAULT_ROCKS;
		if (!crabSpeed || isNaN(crabSpeed) || crabSpeed < MIN_SPEED || crabSpeed > MAX_SPEED)
			this.settings.crabspeed.value = crabSpeed = DEFAULT_CRAB_SPEED;
		if (!catSpeed || isNaN(catSpeed) || catSpeed < MIN_SPEED || catSpeed > MAX_SPEED)
			this.settings.catspeed.value = catSpeed = DEFAULT_CAT_SPEED;

		if (crabs*1 + bowls*1 + cats*1 + rocks*1 > MAX_ACTORS) { // mais que espaco no mundo
			this.settings.crabs.value = crabs = DEFAULT_CRABS;
			this.settings.bowls.value = bowls = DEFAULT_BOWLS;
			this.settings.cats.value = cats = DEFAULT_CATS;
			this.settings.rocks.value = rocks = DEFAULT_ROCKS;
		}

		var settings = { // create obj settings with values
			lives: lives,
			crabs: crabs,
			bowls: bowls,
			cats: cats,
			rocks: rocks,
			crabSpeed: crabSpeed,
			catSpeed: catSpeed
		}
		return settings;
	},

	setSingleLabel: function(label) {
		this.control.single.value = label;
	},

	setCoopLabel: function(label) {
		this.control.coop.value = label;
	},

	setPauseLabel: function(label) {
		this.control.pause.value = label;
	},

	disablePause: function() {
		this.control.pause.disabled = true;
	},

	enablePause: function() {
		this.control.pause.disabled = false;
	},

	disableSingle: function() {
		this.control.single.disabled = true;
	},

	enableSingle: function() {
		this.control.single.disabled = false;
	},

	disableCoop: function() {
		this.control.coop.disabled = true;
	},

	enableCoop: function() {
		this.control.coop.disabled = false;
	},
}



// CONTROLER FUNCTIONS

function keyEvent(event) {
	var code = event.keyCode;
	switch(code) {
	case 37: // LEFT
		if (game.animations.running) {
			game.players[0].move(-1, 0);
			event.preventDefault(); // para nao scrollar
		}
		break;
	case 38: // UP
		if (game.animations.running) {
			game.players[0].move(0, -1);
			event.preventDefault();
		}
		break;
	case 39: // RIGHT
		if (game.animations.running) {
			game.players[0].move(1, 0);
			event.preventDefault();
		}
		break;
	case 40: // DOWN
		if (game.animations.running) {
			game.players[0].move(0, 1);
			event.preventDefault();
		}
		break;
	case 32: // SPACE
		document.getElementById("menucontrol").pause.click();
		event.preventDefault();
		break;
	case 49: // 1
		document.getElementById("menucontrol").single.click();
		event.preventDefault();
		break;
	case 50: // 2
		document.getElementById("menucontrol").coop.click();
		event.preventDefault();
		break;
	case 87: // W
		if (game.players.length == 2 && game.animations.running) {
			game.players[1].move(0, -1);
			event.preventDefault();
		}
		break;
	case 83: // S
		if (game.players.length == 2 && game.animations.running) {
			game.players[1].move(0, 1);
			event.preventDefault();
		}
		break;
	case 65: // A
		if (game.players.length == 2 && game.animations.running) {
			game.players[1].move(-1, 0);
			event.preventDefault();
		}
		break;
	case 68: // D
		if (game.players.length == 2 && game.animations.running) {
			game.players[1].move(1, 0);
			event.preventDefault();
		}
		break;
	}
}



// HTML FUNCTIONS

function onLoad() {
	gui.init();
	gui.setSettings();
	gui.setSingleLabel(SINGLE_LABEL);
	gui.setCoopLabel(COOP_LABEL);
	gui.disableSingle();
	gui.disableCoop();
	gui.disablePause();
	game.load();
}	

function onClickStartSingle() {
	gui.setSingleLabel(RESTART_LABEL);
	gui.setCoopLabel(COOP_LABEL);
	gui.setPauseLabel(PAUSE_LABEL);
	gui.enablePause();
	var settings = gui.getSettings();
	settings.coop = false;
	game.start(settings);
}

function onClickStartCoop() {
	gui.setSingleLabel(SINGLE_LABEL);
	gui.setCoopLabel(RESTART_LABEL);
	gui.setPauseLabel(PAUSE_LABEL);
	gui.enablePause();
	var settings = gui.getSettings();
	settings.coop = true;
	game.start(settings);
}

function onClickPause() {
	if (game.animations.running) {
		gui.setPauseLabel(UNPAUSE_LABEL);
		game.pause();
	}
	else {
		gui.setPauseLabel(PAUSE_LABEL);
		game.unpause();
	}
}
