var myId=0;
var land;
var shadow;
var gameObj;
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
var playerID;
//-------temp var for spawnZombie test-------//
var tempZombie = 1;
var targetSurvive;
var killtest = 0;
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
		var tnk = new Survive(i, game, gameObj);
		playersList[i] = tnk;
    console.log(playersList[i]);


	}
  
  eurecaClient.exports.spawnZombie = function(zombieID, x, y, signToPlayer)
	{
    
    playerID = signToPlayer;
    
    if (zombieID == tempZombie++){
		console.log('SPAWN ZOMBIE');
    var tnk1 = new EnemyZombie(zombieID, game,playersList[playerID].gameObj);
    playersList[zombieID] = tnk1;
    //console.log(gameObj);
    //console.log(playersList[playerID].gameObj);

    }
    else{
      return;
    }
	}
	
  	eurecaClient.exports.updateState = function(id, state)
	{
		if (playersList[id])  {
			playersList[id].cursor = state;
			playersList[id].gameObj.x = state.x;
			playersList[id].gameObj.y = state.y;
			playersList[id].gameObj.angle = state.angle;
			playersList[id].turret.rotation = state.rot;
			playersList[id].update();
		}
	}
}

EnemyZombie = function (index, game, player) {

    var x = 0;
    var y = 0;

    this.game = game;
    this.health = 3;
    console.log(player);
    this.player = player;

    this.fireRate = 1000;
    this.nextFire = 0;
    this.alive = true;

    this.shadow = game.add.sprite(150, 150, 'shadow');
    this.gameObj = game.add.sprite(150, 150, '');
    this.turret = game.add.sprite(150, 150, 'zombie1');

    this.shadow.anchor.set(0.5);
    this.gameObj.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    this.gameObj.name = index.toString();
    game.physics.enable(this.gameObj, Phaser.Physics.ARCADE);
    
};

EnemyZombie.prototype.damage = function() {

    this.health -= 1;

    if (this.health <= 0)
    {
        this.alive = false;

        this.shadow.kill();
        this.gameObj.kill();
        this.turret.kill();

        return true;
    }

    return false;

}

EnemyZombie.prototype.update = function() {

    this.shadow.x = this.gameObj.x;
    this.shadow.y = this.gameObj.y;
    this.shadow.rotation = this.gameObj.rotation;

    this.turret.x = this.gameObj.x;
    this.turret.y = this.gameObj.y;
    //console.log(this.player);
    this.turret.rotation = this.game.physics.arcade.angleBetween(this.gameObj, this.player);
    // game.physics.arcade.moveToXY(this.gameObj,this.player.x - 30,this.player.y - 30,50);

};

EnemyZombie.prototype.kill = function() {
	this.alive = false;
	this.gameObj.kill();
	this.turret.kill();
	this.shadow.kill();
}

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
    this.fireRate = 100;
    this.nextFire = 0;
    this.alive = true;

    this.shadow = game.add.sprite(x, y, 'shadow');
    this.gameObj = game.add.sprite(x, y, '');
    this.turret = game.add.sprite(x, y, 'player');
    this.breath = this.turret.animations.add('breath');
    this.turret.animations.play('breath',5,true);

    this.shadow.anchor.set(0.5);
    this.gameObj.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);

    this.gameObj.id = index;
    game.physics.enable(this.gameObj, Phaser.Physics.ARCADE);
    this.gameObj.body.immovable = false;
    this.gameObj.body.collideWorldBounds = true;
    this.gameObj.body.bounce.setTo(0, 0);
	  this.gameObj.body.velocity.x = 0;
	  this.gameObj.body.velocity.y = 0;

    this.gameObj.angle = 0;

    game.physics.arcade.velocityFromRotation(this.gameObj.rotation, 0, this.gameObj.body.velocity);

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
		if (this.gameObj.id == myId)
		{
			// send latest valid state to the server
			this.input.x = this.gameObj.x;
			this.input.y = this.gameObj.y;
			this.input.angle = this.gameObj.angle;
			this.input.rot = this.turret.rotation;
			
			
			eurecaServer.handleKeys(this.input);
			
		}
	}
	
	
    if (this.cursor.left)
    {
        // this.gameObj.x += -2;
        this.gameObj.angle = 180;
        this.currentSpeed = 300;
    }
    else if (this.cursor.right)
    {
        // this.gameObj.x += 2;
        this.gameObj.angle = 0;
        this.currentSpeed = 300;

    }	
    if (this.cursor.up)
    {
        // this.gameObj.y += -2;
        this.gameObj.angle = 270;
        this.currentSpeed = 300;
               

    }
    if (this.cursor.down)
    {
        // this.gameObj.y += 2;
        this.gameObj.angle = 90;
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
        game.physics.arcade.velocityFromRotation(this.gameObj.rotation, this.currentSpeed, this.gameObj.body.velocity);
    }	
	else
	{
		game.physics.arcade.velocityFromRotation(this.gameObj.rotation, 0, this.gameObj.body.velocity);
	}	
	
	
	
    this.shadow.x = this.gameObj.x;
    this.shadow.y = this.gameObj.y;
    this.shadow.rotation = this.gameObj.rotation;

    this.turret.x = this.gameObj.x;
    this.turret.y = this.gameObj.y;
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
}


Survive.prototype.kill = function() {
	this.alive = false;
	this.gameObj.kill();
	this.turret.kill();
	this.shadow.kill();
}

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: eurecaClientSetup, update: update, render: render });

function preload () {

 
    game.load.image('shadow', 'assets/shadow.png');
    game.load.image('logo', 'assets/logo.png');
    game.load.spritesheet('player', 'assets/player.png',107,70,19);
    game.load.image('zombie1', 'assets/zombie1.png');
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('grass', 'assets/light_grass.png');
    //game.load.spritesheet('kaboom1', 'assets/explosion.png', 64, 64, 23);
    game.load.spritesheet('kaboom', 'assets/blood.png', 150, 150, 6);
    
}



function create () {

    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(-100, -100, 200, 200);
	game.stage.disableVisibilityChange  = true;
	
    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, 800, 600, 'grass');
    land.fixedToCamera = true;
    
    playersList = {};
	
	player = new Survive(myId, game, gameObj);
	playersList[myId] = player;
	gameObj = player.gameObj;
	turret = player.turret;
	gameObj.x=0;
	gameObj.y=0;
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

    gameObj.bringToTop();
    turret.bringToTop();
		
    logo = game.add.sprite(0, 200, 'logo');
    logo.fixedToCamera = true;

    game.input.onDown.add(removeLogo, this);

    game.camera.follow(gameObj);
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
	player.input.tx = game.input.x + game.camera.x;
	player.input.ty = game.input.y + game.camera.y;
	
	
	
	turret.rotation = game.physics.arcade.angleToPointer(turret);	
    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;

    for (var i in playersList)
    {
		if (!playersList[i]) continue;
		var curBullets = playersList[i].bullets;
		var curSurvive = playersList[i].gameObj;
		for (var j in playersList)
		{
			if (!playersList[j]) continue;
			if (j!=i) 
			{
			
				targetSurvive = playersList[j].gameObj;
        killtest = j;
				//console.log(playersList[j].gameObj);
        //game.physics.arcade.OVERLAP_BIAS = 5;
				game.physics.arcade.overlap(curBullets, targetSurvive, bulletHitPlayer, null, this);
			//game.debug.geom(playersList[j].gameObj, 'rgb(0,255,0)');
			}
			if (playersList[j].alive)
			{
				playersList[j].update();
			}			
		}
    }
}

function bulletHitPlayer (gameObj, bullet) {

    console.log(targetSurvive);
    bullet.kill();
    playersList[killtest].kill();
    var explosionAnimation = explosions.getFirstExists(false);
    explosionAnimation.reset(111, 111);
    explosionAnimation.play('kaboom', 30, false, true);
}

function render () {
  point = new Phaser.Point(111, 111);
  game.debug.geom(targetSurvive, 'rgb(0,255,0)');
  
}

