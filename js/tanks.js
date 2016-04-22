var myId=0;
var land;
var shadow;
var tank;
var turret;
var breath;
var player;
var playersList;
var enemyBullets;
var enemiesTotal = 0;
var enemiesAlive = 0;
var explosions;
var logo;
var cursors;
var bullets;
var fireRate = 100;
var nextFire = 0;
var ready = false;
var eurecaServer;
var zombieList;
var zombieID = 0;

var eurecaClientSetup = function() {
	var eurecaClient = new Eureca.Client();
	eurecaClient.ready(function (proxy) {		
		eurecaServer = proxy;
	});
	
	
	//methods defined under "exports" namespace become available in the server side
	
	eurecaClient.exports.setId = function(id) 
	{
		//create() is moved here to make sure nothing is created before uniq id assignation
		myId = id;
		create();
		eurecaServer.handshake();
		ready = true;
	}	
	
	eurecaClient.exports.kill = function(id)
	{	
		if (playersList[id]) {
			playersList[id].kill();
			console.log('killing ', id, playersList[id]);
		}
	}	
	
	eurecaClient.exports.spawnPlayer = function(i, x, y)
	{
		
		if (i == myId) return; //this is me
		
		console.log('SPAWN');
		var tnk = new Survive(i, game, tank);
		playersList[i] = tnk;

	}
  
  eurecaClient.exports.spawnZombie = function(zombieID, x, y)
	{
    if (zombieID == 1 || zombieID == 2){
		console.log('SPAWN');
    var tnk1 = new EnemyTank(zombieID, game, tank);
    playersList[zombieID] = tnk1;
    }
    else{
      return;
    }
	}
	
  	eurecaClient.exports.updateState = function(id, state)
	{
		if (playersList[id])  {
			playersList[id].cursor = state;
			playersList[id].tank.x = state.x;
			playersList[id].tank.y = state.y;
			playersList[id].tank.angle = state.angle;
			playersList[id].turret.rotation = state.rot;
			playersList[id].update();
		}
	}
}

EnemyTank = function (index, game, player) {

    var x = 0;
    var y = 0;

    this.game = game;
    this.health = 3;
    this.player = player;
    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(20, 'bullet', 0, false);
    this.bullets.setAll('anchor.x', -1);
    this.bullets.setAll('anchor.y', -0.5);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);	
    this.fireRate = 1000;
    this.nextFire = 0;
    this.alive = true;

    this.shadow = game.add.sprite(x, y, 'enemy', 'shadow');
    this.tank = game.add.sprite(x, y, 'enemy', 'tank1');
    this.turret = game.add.sprite(x, y, 'enemy', 'turret');

    this.shadow.anchor.set(0.5);
    this.tank.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    this.tank.name = index.toString();
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
    this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(1, 1);

    this.tank.angle = game.rnd.angle();

    game.physics.arcade.velocityFromRotation(this.tank.rotation, 50, this.tank.body.velocity);

};

EnemyTank.prototype.damage = function() {

    this.health -= 1;

    if (this.health <= 0)
    {
        this.alive = false;

        this.shadow.kill();
        this.tank.kill();
        this.turret.kill();

        return true;
    }

    return false;

}

EnemyTank.prototype.update = function() {

    this.shadow.x = this.tank.x;
    this.shadow.y = this.tank.y;
    this.shadow.rotation = this.tank.rotation;

    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;
    this.turret.rotation = this.game.physics.arcade.angleBetween(this.tank, this.player);

    // if (this.game.physics.arcade.distanceBetween(this.tank, this.player) < 300)
    // {
        // if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        // {
            // this.nextFire = this.game.time.now + this.fireRate;

            // var bullet = this.bullets.getFirstDead();

            // bullet.reset(this.turret.x, this.turret.y);

            // bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 500);
        // }
    // }

};

Survive = function (index, game, player) {
	this.cursor = {
		left:false,
		right:false,
		up:false,
    down:false,
		fire:false		
	}

	this.input = {
		left:false,
		right:false,
		up:false,
    down:false,
		fire:false
	}

    var x = 0;
    var y = 0;

    this.game = game;
    this.health = 30;
    this.player = player;
    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(20, 'bullet', 0, false);
    this.bullets.setAll('anchor.x', -1);
    this.bullets.setAll('anchor.y', -0.5);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);	
    //this.body.velocity.y = 0;
	
	this.currentSpeed =0;
    this.fireRate = 500;
    this.nextFire = 0;
    this.alive = true;

    this.shadow = game.add.sprite(x, y, 'tank', 'shadow');
    this.tank = game.add.sprite(x, y, '');
    this.turret = game.add.sprite(x, y, 'test');
    this.breath = this.turret.animations.add('breath');
    this.turret.animations.play('breath',5,true);

    this.shadow.anchor.set(0.5);
    this.tank.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    this.tank.id = index;
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
    this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(0, 0);
	  this.tank.body.velocity.x = 0;
	  this.tank.body.velocity.y = 0;

    this.tank.angle = 0;

    game.physics.arcade.velocityFromRotation(this.tank.rotation, 0, this.tank.body.velocity);

};

Survive.prototype.update = function() {
		
	//for (var i in this.input) this.cursor[i] = this.input[i];	
		var inputChanged = (
		this.cursor.left != this.input.left ||
		this.cursor.right != this.input.right ||
		this.cursor.up != this.input.up ||
    this.cursor.down != this.input.down ||
		this.cursor.fire != this.input.fire
	);
	
	
	if (inputChanged)
	{
		//Handle input change here
		//send new values to the server		
		if (this.tank.id == myId)
		{
			// send latest valid state to the server
			this.input.x = this.tank.x;
			this.input.y = this.tank.y;
			this.input.angle = this.tank.angle;
			this.input.rot = this.turret.rotation;
			
			
			eurecaServer.handleKeys(this.input);
			
		}
	}
	
	
    if (this.cursor.left)
    {
        // this.tank.x += -2;
        this.tank.angle = 180;
        this.currentSpeed = 300;
        //this.tank.body.velocity.x = 300
    }
    else if (this.cursor.right)
    {
        // this.tank.x += 2;
        this.tank.angle = 0;
        this.currentSpeed = 300;

    }	
    if (this.cursor.up)
    {
        // this.tank.y += -2;
        //  The speed we'll travel at
        this.tank.angle = 270;
        this.currentSpeed = 300;
               

    }
    if (this.cursor.down)
    {
        // this.tank.y += 2;
        this.tank.angle = 90;
        this.currentSpeed = 300;
    }
    else
    {
        if (this.currentSpeed > 0)
        {
            this.currentSpeed -= 20;
        }
    }
    if (this.cursor.fire)
    {	
		this.fire({x:this.cursor.tx, y:this.cursor.ty});
    }
	
	
	
    if (this.currentSpeed > 0)
    {
        game.physics.arcade.velocityFromRotation(this.tank.rotation, this.currentSpeed, this.tank.body.velocity);
    }	
	else
	{
		game.physics.arcade.velocityFromRotation(this.tank.rotation, 0, this.tank.body.velocity);
	}	
	
	
	
    this.shadow.x = this.tank.x;
    this.shadow.y = this.tank.y;
    this.shadow.rotation = this.tank.rotation;

    this.turret.x = this.tank.x;
    this.turret.y = this.tank.y;
};

Survive.prototype.fire = function(target) {
		if (!this.alive) return;
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {
            this.nextFire = this.game.time.now + this.fireRate;
            var bullet = this.bullets.getFirstDead();
            bullet.reset(this.turret.x, this.turret.y);

			bullet.rotation = this.game.physics.arcade.moveToObject(bullet, target, 500);
        }
    console.log(playersList);  
}


Survive.prototype.kill = function() {
	this.alive = false;
	this.tank.kill();
	this.turret.kill();
	this.shadow.kill();
}

//var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: eurecaClientSetup, update: update, render: render });

function preload () {

    game.load.atlas('tank', 'assets/tanks.png', 'assets/tanks.json');
    game.load.atlas('enemy', 'assets/enemy-tanks.png', 'assets/tanks.json');
    game.load.image('logo', 'assets/logo.png');
    game.load.spritesheet('test', 'assets/player.png',107,70,19);
    // game.load.image('test', 'assets/player/survivor-idle_shotgun_1.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('earth', 'assets/scorched_earth.png');
    game.load.spritesheet('kaboom', 'assets/explosion.png', 64, 64, 23);
    
}



function create () {

    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(-100, -100, 200, 200);
	game.stage.disableVisibilityChange  = true;
	
    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, 800, 600, 'earth');
    land.fixedToCamera = true;
    
    playersList = {};
	
	player = new Survive(myId, game, tank);
	playersList[myId] = player;
	tank = player.tank;
	turret = player.turret;
	tank.x=0;
	tank.y=0;
	bullets = player.bullets;
	shadow = player.shadow;	

    //  Explosion pool
    explosions = game.add.group();

    for (var i = 0; i < 10; i++)
    {
        var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
        explosionAnimation.anchor.setTo(0.5, 0.5);
        explosionAnimation.animations.add('kaboom');
    }

    tank.bringToTop();
    turret.bringToTop();
		
    logo = game.add.sprite(0, 200, 'logo');
    logo.fixedToCamera = true;

    game.input.onDown.add(removeLogo, this);

    game.camera.follow(tank);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();
	
	setTimeout(removeLogo, 1000);
	
}

function removeLogo () {
    game.input.onDown.remove(removeLogo, this);
    logo.kill();
}

function update () {
	if (!ready) return;
	player.input.left = cursors.left.isDown;
	player.input.right = cursors.right.isDown;
	player.input.up = cursors.up.isDown;
  player.input.down = cursors.down.isDown;
	player.input.fire = game.input.activePointer.isDown;
	player.input.tx = game.input.x+ game.camera.x;
	player.input.ty = game.input.y+ game.camera.y;
	
	
	
	turret.rotation = game.physics.arcade.angleToPointer(turret);	
    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;

    for (var i in playersList)
    {
		if (!playersList[i]) continue;
		var curBullets = playersList[i].bullets;
		var curSurvive = playersList[i].tank;
		for (var j in playersList)
		{
			if (!playersList[j]) continue;
			if (j!=i) 
			{
			
				var targetSurvive = playersList[j].tank - 0.1;
				
				game.physics.arcade.overlap(curBullets, targetSurvive, bulletHitPlayer, null, this);
			
			}
			if (playersList[j].alive)
			{
				playersList[j].update();
			}			
		}
    }
}

function bulletHitPlayer (tank, bullet) {

    bullet.kill();
}

function render () {}

