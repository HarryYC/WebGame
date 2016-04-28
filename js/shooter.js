

var myId=0;
var land;
var shadow;
var gameObj;
var turret;
var breath;
var player;
var playersList;
var explosions;
var logo;
var cursors;
var bullets;
var fireRate = 100;
var nextFire = 0;
var ready = false;
var eurecaServer;
var zombieList;
var gameStart = false;
var zombieID = 0;
var playerID;
//-------temp var for addZombie test-------//
// var tempZombie = 1;
// var targetSurvive;
// var killtest = 0;
// var debugObj;
// var localZombie;
var key1;

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
		//	console.log('killing ', id, playersList[id]);
		}
	}	
	
	eurecaClient.exports.spawnPlayer = function(i, x, y)
	{
		
		if (i == myId || ( i in playersList)) return; //this is me or other exsists player
		
		//console.log('SPAWN');
		var tnk = new Survive(i, game, gameObj);
		playersList[i] = tnk;
    //console.log(playersList[i]);


	}
  
  eurecaClient.exports.spawnZombie = function(zombieID, x, y, signToPlayer)
	{ 
    playerID = signToPlayer;
//		console.log('SPAWN ZOMBIE');
//    console.log(playerID);
    var tnk1 = new EnemyZombie(zombieID, x, y, game,playersList[playerID].gameObj);
    zombieList[zombieID] = tnk1;
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

EnemyZombie = function (index, x, y, game, player) {

    // var x = Math.floor((Math.random() * 500) + 1);
    // var y = Math.floor((Math.random() * 500) + 1);

    this.game = game;
    this.health = 3;
    this.player = player;
    this.alive = true;

    this.gameObj = game.add.sprite(x, y, 'shadow');
    this.turret = game.add.sprite(x, y, 'zombie');
    this.item = game.add.sprite(x, y, 'potion');
    this.item.burst = game.add.sprite(x, y, 'potion');
    this.item.burst.show = this.item.burst.animations.add('burst');
    this.item.burst.show.play();
    this.item.alpha = 0;
    this.burst
    this.attack = this.turret.animations.add('attack',[0,1,2,3,4,5,6,7,8],15,false);
    this.walk = this.turret.animations.add('walk',[9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25],15,true);
    this.walk.play();
    
    this.gameObj.debug = true;
    this.turret.debug = true;
    game.physics.enable(this.gameObj, Phaser.Physics.ARCADE); 
    this.gameObj.body.immovable = false;
    this.gameObj.body.collideWorldBounds = true;
    this.gameObj.body.bounce.setTo(0, 0);
    this.gameObj.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);
    this.item.anchor.set(0.3, 0.5);
    this.gameObj.id = index;
    this.gameObj.name = index.toString();

};

EnemyZombie.prototype.damage = function() {

    this.health -= 1;

    if (this.health <= 0)
    {
        this.alive = false;
        this.gameObj.kill();
        this.turret.kill();
        return true;
    }

    return false;

}

EnemyZombie.prototype.update = function() {
    
    //console.log(this.gameObj);
    //console.log(this.player);
    this.turret.x = this.gameObj.x;
    this.turret.y = this.gameObj.y;
    this.item.x = this.gameObj.x; 
    this.item.y = this.gameObj.y;
    // this.turret.rotation = this.game.physics.arcade.angleBetween(this.gameObj, this.player);
    // this.gameObj.rotation = this.turret.rotation;
    // game.physics.arcade.moveToXY(this.gameObj,this.player.x - 30,this.player.y - 30,50);
};

EnemyZombie.prototype.kill = function() {
	this.alive = false;
	this.gameObj.kill();
	this.turret.kill();
  this.item.alpha = 1;
}

Survive = function (index, game, player) {
	this.cursor = {
		left:false,
		right:false,
		up:false,
    down:false,
		fire:false,
    addZombie:false
	}

	this.input = {
		left:false,
		right:false,
		up:false,
    down:false,
		fire:false,
    addZombie:false
	}

    var x = 0;
    var y = 0;

    this.game = game;
    this.health = 1000;
    this.player = player;
    this.bullets = game.add.group();
    this.bullets.enableBody = true;
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    this.bullets.createMultiple(20, 'bullet');
    this.bullets.setAll('anchor.x', -1);
    this.bullets.setAll('anchor.y', -0.5);
    this.bullets.setAll('outOfBoundsKill', true);
    this.bullets.setAll('checkWorldBounds', true);	
    
    

    
    
    // this.bullets.setAll('width', 100);	
    // this.bullets.setAll('height', 100);	
    // this.localZombie = game.add.group();
	  // this.localZombie.createMultiple(20, 'zombie1', 0, false);
    // this.localZombie.setAll('outOfBoundsKill', true);
    // this.localZombie.setAll('checkWorldBounds', true);
    
    this.currentSpeed =0;
    this.fireRate = 300;
    this.nextFire = 0;
    this.alive = true;
    // this.attack = this.turret.animations.add('attack',[0,1,2,3,4,5,6,7,8],15,false);
    // this.walk = this.turret.animations.add('walk',[9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25],15,true);
    //this.shadow = game.add.sprite(x, y, 'shadow');
    this.gameObj = game.add.sprite(x, y, 'shadow');
    this.turret = game.add.sprite(x, y, 'player');
    this.grave = game.add.sprite(x, y, 'grave');
    this.breath = this.turret.animations.add('breath',[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],20,true);
    this.attack = this.turret.animations.add('attack',[20,21,22],15,false);
    this.turret.animations.play('breath');

    //this.shadow.anchor.set(0.5);
    this.gameObj.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);
    this.grave.anchor.set(0.4,0.5);
    this.grave.alpha = 0;


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
		this.cursor.fire != this.input.fire ||
    this.cursor.addZombie != this.input.addZombie
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
	
	  if (this.cursor.addZombie)
    {	
		// this.addZombie({x:this.cursor.tx, y:this.cursor.ty});
    }
	
    if (this.currentSpeed > 0)
    {
        game.physics.arcade.velocityFromRotation(this.gameObj.rotation, this.currentSpeed, this.gameObj.body.velocity);
    }	
	else
	{
		game.physics.arcade.velocityFromRotation(this.gameObj.rotation, 0, this.gameObj.body.velocity);
	}	

    this.turret.x = this.gameObj.x;
    this.turret.y = this.gameObj.y;
    this.grave.x = this.gameObj.x; 
    this.grave.y = this.gameObj.y;
};

Survive.prototype.fire = function(target) {
		if (!this.alive) return;
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {
            this.nextFire = this.game.time.now + this.fireRate;
            var bullet = this.bullets.getFirstDead();
            bullet.reset(this.turret.x, this.turret.y);
            bullet.rotation = this.game.physics.arcade.moveToObject(bullet, target, 500);
            
            this.turret.animations.play('attack');
            this.turret.events.onAnimationComplete.add(function(){
            this.breath.play();
    }, this);
        }
}
Survive.prototype.kill = function() {
	this.alive = false;
	this.gameObj.kill();
	this.turret.kill();
  this.grave.alpha = 1;
}

var game = new Phaser.Game(1024, 768, Phaser.CANVAS, 'shooting-game', { preload: preload, create: eurecaClientSetup, update: update, render: render });

function preload () {

 
    game.load.image('shadow', 'assets/shadow.png');
    game.load.image('logo', 'assets/logo.png');
    game.load.spritesheet('player', 'assets/player.png',107,70,23);
    game.load.spritesheet('zombie', 'assets/zombie.png',90,97,26);
    game.load.image('grave', 'assets/grave.png',50,50);
    // game.load.image('zombie1', 'assets/zombie1.png',71,71);
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('grass', 'assets/light_grass.png');
    //game.load.spritesheet('kaboom1', 'assets/explosion.png', 64, 64, 23);
    game.load.spritesheet('kaboom', 'assets/blood.png', 150, 150, 6);
    game.load.image('potion', 'assets/potion.png',64,64);
    game.load.spritesheet('burst', 'assets/burst.png', 64, 64, 60);

    key1 = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
    key1.onDown.add(startGame, this);
    
}

function startGame () {
    // console.log('1111111');
    // console.log('SPAWN ZOMBIE');
    // var tnk1 = new EnemyZombie("zzzzombie1", game,myId);
    // zombieList["zzzzombie1"] = tnk1;
    // this.eurecaClientSetup.addZombie(1, 0, 0, myId)
    if (gameStart == true) return;
      eurecaServer.begin();
}


function create () {

    //  Resize our game world to be a 2000 x 2000 square
    game.world.setBounds(-100, -100, 1024, 768);
	game.stage.disableVisibilityChange  = true;
	
    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, 1024, 768, 'grass');
    land.fixedToCamera = true;
    
    playersList = {};
    zombieList = {};
	
	player = new Survive(myId, game, gameObj);
	playersList[myId] = player;
	gameObj = player.gameObj;
	turret = player.turret;
	gameObj.x=0;
	gameObj.y=0;
	bullets = player.bullets;
  localZombie = player.localZombie;
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
		
    //logo = game.add.sprite(0, 100, 'logo');
    //logo.fixedToCamera = true;
    addLogo();
    //game.input.onDown.add(removeLogo, this);

    game.camera.follow(gameObj);
    game.camera.deadzone = new Phaser.Rectangle(150, 150, 500, 300);
    game.camera.focusOnXY(0, 0);

    cursors = game.input.keyboard.createCursorKeys();
    //setTimeout(removeLogo, 5000);
	
}
function addLogo() {
    logo = game.add.sprite(80, 200, 'logo');
    logo.fixedToCamera = true;
}
function removeLogo () {
    //game.input.onDown.remove(removeLogo, this);
    logo.kill();
}

function update () {
	if (!ready) return;
	//master client press 1, gamestart
	if (Object.keys(zombieList).length > 0){
	    gameStart = true;
	    removeLogo();
	}
	//console.log(Object.keys(zombieList).length);
	if (Object.keys(zombieList).length == 0 && gameStart == true){
	    gameStart = false;
	    addLogo();
	}
  //console.log(myId + zombieID++);
	player.input.left = cursors.left.isDown;
	player.input.right = cursors.right.isDown;
	player.input.up = cursors.up.isDown;
  player.input.down = cursors.down.isDown;
	player.input.fire = game.input.activePointer.leftButton.isDown;
  player.input.addZombie = game.input.activePointer.middleButton.isDown;
  // player.input.addZombie = game.input.activePointer.rightButton.isDown;
	player.input.tx = game.input.x + game.camera.x;
	player.input.ty = game.input.y + game.camera.y;
	
	
	turret.rotation = game.physics.arcade.angleToPointer(turret);	
    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;

    for (var i in playersList)
    {
      if (!playersList[i]) continue;
      var curBullets = playersList[i].bullets;
      //var curZombie = playersList[i].localZombie;
      var curSurvive = playersList[i].gameObj;
      for (var j in zombieList)
      {
        if (!zombieList[j]) continue;
        // if (j!=i) 
        // {
          var targetSurvive = zombieList[j].gameObj;
          //debugObj = playersList[j];
          //console.log(targetSurvive);
          //killtest = j;
          //console.log(playersList[j].gameObj);
          //game.physics.arcade.OVERLAP_BIAS = 5;
          game.physics.arcade.collide(zombieList[j].gameObj,curSurvive,zombieATK,null,this);
          //game.physics.arcade.collide(curBullets, targetSurvive,bulletHitPlayer,null,this);
          game.physics.arcade.overlap(playersList[i].bullets, zombieList[j].gameObj, bulletHitPlayer,null,this);
        //game.debug.geom(playersList[j].gameObj, 'rgb(0,255,0)');
        // }

	if (j in zombieList)
	{
        if (zombieList[j].alive)
        {
          zombieList[j].update();
                       for (var k in zombieList)
      {

        game.physics.arcade.collide(zombieList[j].gameObj, zombieList[k].gameObj);
      }
        }
	  }

      }
      if (playersList[i].alive)
      {
        if (playersList[i].health < 0){
          playersList[i].kill();
        }
        playersList[i].update();
      }
         // game.physics.arcade.collide(this.zombieList, this.zombieList);      
    }
}

function zombieATK (zombie, player)
{        
    zombieList[zombie.id].turret.animations.play('attack', 15, false);
            zombieList[zombie.id].turret.events.onAnimationComplete.add(function(){
            playersList[player.id].health--;
    }, this);
    zombieList[zombie.id].turret.events.onAnimationComplete.add(function(){
            zombieList[zombie.id].walk.play();
    }, this);

    
    // player.gameObj.health--;
}
function te(gameObj){
  console.log("over");
  var explosionAnimation = explosions.getFirstExists(false);
    explosionAnimation.reset(gameObj.x, gameObj.y);
    explosionAnimation.play('kaboom', 30, false, true);
}
function bulletHitPlayer (gameObj, bullet) {

    //console.log(gameObj);
    //game.debug.bodyInfo(debugObj, 32, 32);
    //game.debug.geom(targetSurvive, 'rgb(0,255,0)');
    bullet.kill();
    // console.log(zombieList[gameObj.id].health);
    if (zombieList[gameObj.id].health > 0){
      zombieList[gameObj.id].health--;
    }else
    {
       zombieList[gameObj.id].kill();
       delete zombieList[gameObj.id];
    }
    // zombieList[gameObj.id].kill();
    var explosionAnimation = explosions.getFirstExists(false);
    explosionAnimation.reset(gameObj.x, gameObj.y);
    explosionAnimation.play('kaboom', 30, false, true);

}

function render () {
  //game.debug.geom(point, 'rgb(0,255,0)');
  if (!ready) return;
  //game.debug.spriteBounds(playersList[myId].gameObj, 'rgb(0,255,0)',true);
      for (var i in playersList)
      {
      game.debug.text('HP: ' + playersList[i].health + '/1000', playersList[i].gameObj.x + 35, playersList[i].gameObj.y + 50);
      // game.debug.text(playersList[i].gameObj.x,playersList[i].gameObj.x + 50, playersList[i].gameObj.y + 30);
      // game.debug.text(playersList[i].gameObj.y,playersList[i].gameObj.x + 50, playersList[i].gameObj.y + 50);
      
       // game.debug.spriteBounds(playersList[i].gameObj);
       // game.debug.body(playersList[i].bullets);
       // game.debug.bodyInfo(playersList[i].bullets);
      
      }
      // for (var j in zombieList)
      // {
      // game.debug.body(zombieList[j]);
      // game.debug.bodyInfo(zombieList[j]);
      // game.debug.spriteInfo(zombieList[j].gameObj,32,32);
      // game.debug.spriteBounds(zombieList[j].gameObj);
      // game.debug.spriteBounds(zombieList[j].gameObj,'rgb(0,255,0)',true);
      // }
}

