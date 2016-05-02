var myId = 0;
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
var itemList;
var itemID = 0;
var playerSpeed = 200;
var bgm;
var gunShot;
var zombieRoar;
var zombieAttack;
//-------temp var for addZombie test-------//
// var tempZombie = 1;
// var targetSurvive;
// var killtest = 0;
// var debugObj;
// var localZombie;
var key1;

var eurecaClientSetup = function() {
    var eurecaClient = new Eureca.Client();
    eurecaClient.ready(function(proxy) {
        eurecaServer = proxy;
    });


    //methods defined under "exports" namespace become available in the server side

    eurecaClient.exports.setId = function(id) {
        //create() is moved here to make sure nothing is created before uniq id assignation
        myId = id;
        create();
        eurecaServer.handshake();
        ready = true;
    }

    eurecaClient.exports.kill = function(id) {
        if (playersList[id]) {
            playersList[id].kill();
            //	console.log('killing ', id, playersList[id]);
        }
    }

    eurecaClient.exports.spawnPlayer = function(i, x, y) {

        if (i == myId || (i in playersList)) return; //this is me or other exsists player

        //console.log('SPAWN');
        var tnk = new Survive(i, game, gameObj);
        playersList[i] = tnk;
        //console.log(playersList[i]);


    }

    eurecaClient.exports.spawnZombie = function(zombieID, x, y, signToPlayer, randomNum) {
        playerID = signToPlayer;
        //		console.log('SPAWN ZOMBIE');
        //    console.log(playerID);
        var tnk1 = new EnemyZombie(zombieID, x, y, game, playersList[playerID].gameObj, randomNum);
        zombieList[zombieID] = tnk1;
    }

    eurecaClient.exports.updateState = function(id, state) {
        if (playersList[id]) {
            playersList[id].cursor = state;
            playersList[id].gameObj.x = state.x;
            playersList[id].gameObj.y = state.y;
            playersList[id].gameObj.angle = state.angle;
            playersList[id].turret.rotation = state.rot;
            playersList[id].update();
        }
    }
}

EnemyZombie = function(index, x, y, game, player, randomNum) {

    // var x = Math.floor((Math.random() * 500) + 1);
    // var y = Math.floor((Math.random() * 500) + 1);

    this.game = game;
    this.health = 3;
    this.player = player;
    this.alive = true;
    this.randomNum = randomNum;

    this.gameObj = game.add.sprite(x, y, 'shadow');
    game.physics.enable(this.gameObj, Phaser.Physics.ARCADE);
    this.gameObj.body.immovable = false;
    this.gameObj.body.collideWorldBounds = true;
    this.gameObj.body.bounce.setTo(0, 0);
    this.gameObj.anchor.set(0.5);
    this.gameObj.id = index;
    this.gameObj.name = index.toString();

    this.turret = game.add.sprite(x, y, 'zombie');
    // var ran = '0x'+Math.floor(Math.random()*16777215).toString(16);
    // console.log(ran);
    // this.turret.tint = ran;
    this.turret.anchor.set(0.3, 0.5);
    this.attack = this.turret.animations.add('attack', [0, 1, 2, 3, 4, 5, 6, 7, 8], 15, false);
    this.walk = this.turret.animations.add('walk', [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], 15, true);
    this.walk.play();
    // console.log(this.randomNum);

    // var randomItem = Math.floor((Math.random() * 100) + 1);
    if (this.randomNum > 1 && this.randomNum < 20) {
        this.item = game.add.sprite(x, y, 'potion');
    } else if (this.randomNum > 20 && this.randomNum < 30) {
        this.item = game.add.sprite(x, y, 'shoes');
    } else if (this.randomNum > 30 && this.randomNum < 40) {
        this.item = game.add.sprite(x, y, 'bulletSpeed');
    } else {
        this.item = {};
    }


    if (Object.keys(this.item).length == 0) {
        this.item.burst = {};
    } else {
        this.item.burst = game.add.sprite(x, y, 'burst');
        this.item.burst.show = this.item.burst.animations.add('show');
        this.item.burst.animations.play('show', 20, true);
        this.item.burst.alpha = 0;
        this.item.burst.anchor.set(0.3, 0.5);
        this.item.anchor.set(0.3, 0.5);
        this.item.alpha = 0;
        game.physics.enable(this.item, Phaser.Physics.ARCADE);
    }
    // this.item = game.add.sprite(x, y, 'potion');

    // 
    // this.item.burst = {};

    // this.item.burst = game.add.sprite(x, y, 'burst');
    // this.item.burst.show = this.item.burst.animations.add('show');
    // this.item.burst.animations.play('show',20,true);
    // this.item.burst.alpha = 0;
    // this.item.burst.anchor.set(0.3, 0.5);


};

EnemyZombie.prototype.damage = function() {

    this.health -= 1;

    if (this.health <= 0) {
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
    this.item.burst.x = this.gameObj.x;
    this.item.burst.y = this.gameObj.y;
    this.turret.rotation = this.game.physics.arcade.angleBetween(this.gameObj, this.player);
    this.gameObj.rotation = this.turret.rotation;
    game.physics.arcade.moveToXY(this.gameObj, this.player.x - 30, this.player.y - 30, 50);
};

EnemyZombie.prototype.kill = function() {
    this.alive = false;
    this.gameObj.kill();
    this.turret.kill();
    this.item.alpha = 1;
    this.item.burst.alpha = 1;
}

Survive = function(index, game, player) {
    this.cursor = {
        left: false,
        right: false,
        up: false,
        down: false,
        fire: false,
        addZombie: false
    }

    this.input = {
        left: false,
        right: false,
        up: false,
        down: false,
        fire: false,
        addZombie: false
    }

    var x = 0;
    var y = 0;
    this.barProgress = 80;
    this.bar = game.add.bitmapData(80, 6);
    this.barFrame = game.add.bitmapData(90, 10);
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

    this.currentSpeed = 0;
    this.speed = 500;
    this.fireRate = 300;
    this.nextFire = 0;
    this.alive = true;
    // this.attack = this.turret.animations.add('attack',[0,1,2,3,4,5,6,7,8],15,false);
    // this.walk = this.turret.animations.add('walk',[9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25],15,true);
    //this.shadow = game.add.sprite(x, y, 'shadow');
    this.gameObj = game.add.sprite(x, y, 'shadow');
    this.turret = game.add.sprite(x, y, 'player');
    this.grave = game.add.sprite(x, y, 'grave');
    this.breath = this.turret.animations.add('breath', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], 20, true);
    this.attack = this.turret.animations.add('attack', [20, 21, 22], 15, false);
    this.turret.animations.play('breath');

    this.hp = game.add.sprite(x, y, this.bar);
    this.hpFrame = game.add.sprite(x, y, this.barFrame);

    this.barFrame.context.fillStyle = '#00685e';
    this.barFrame.context.fillRect(0, 0, 90, 10);
    //this.shadow.anchor.set(0.5);
    this.gameObj.anchor.set(0.5);
    this.turret.anchor.set(0.3, 0.5);
    this.grave.anchor.set(0.4, 0.5);
    this.hp.anchor.set(0.5, 8);
    this.hpFrame.anchor.set(0.5, 5);
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
      game.world.bringToTop(this.hpFrame);
    game.world.bringToTop(this.hp);

    //for (var i in this.input) this.cursor[i] = this.input[i];	
    var inputChanged = (
        this.cursor.left != this.input.left ||
        this.cursor.right != this.input.right ||
        this.cursor.up != this.input.up ||
        this.cursor.down != this.input.down ||
        this.cursor.fire != this.input.fire ||
        this.cursor.addZombie != this.input.addZombie
    );


    if (inputChanged) {
        //Handle input change here
        //send new values to the server		
        if (this.gameObj.id == myId) {
            // send latest valid state to the server
            this.input.x = this.gameObj.x;
            this.input.y = this.gameObj.y;
            this.input.angle = this.gameObj.angle;
            this.input.rot = this.turret.rotation;


            eurecaServer.handleKeys(this.input);

        }
    }


    if (this.cursor.left) {
        // this.gameObj.x += -2;
        this.gameObj.angle = 180;
        this.currentSpeed = this.speed;
    } else if (this.cursor.right) {
        // this.gameObj.x += 2;
        this.gameObj.angle = 0;
        this.currentSpeed = this.speed;

    }
    if (this.cursor.up) {
        // this.gameObj.y += -2;
        this.gameObj.angle = 270;
        this.currentSpeed = this.speed;


    }
    if (this.cursor.down) {
        // this.gameObj.y += 2;
        this.gameObj.angle = 90;
        this.currentSpeed = this.speed;
    } else {
        if (this.currentSpeed > 0) {
            this.currentSpeed -= 20;
        }
    }
    if (this.cursor.fire) {
        this.fire({
            x: this.cursor.tx,
            y: this.cursor.ty
        });
    }

    if (this.cursor.addZombie) {
        console.log("right click");
    }

    if (this.currentSpeed > 0) {
        game.physics.arcade.velocityFromRotation(this.gameObj.rotation, this.currentSpeed, this.gameObj.body.velocity);
    } else {
        game.physics.arcade.velocityFromRotation(this.gameObj.rotation, 0, this.gameObj.body.velocity);
    }

    this.bar.context.clearRect(0, 0, this.bar.width, this.bar.height);


    this.turret.x = this.gameObj.x;
    this.turret.y = this.gameObj.y;
    this.hp.x = this.gameObj.x;
    this.hp.y = this.gameObj.y;
    this.hpFrame.x = this.gameObj.x;
    this.hpFrame.y = this.gameObj.y;
    this.grave.x = this.gameObj.x;
    this.grave.y = this.gameObj.y;
    game.add.tween(this).to({
        barProgress: this.health / 12.5
    }, 100, null, true, 0);

    this.bar.context.clearRect(0, 0, this.bar.width, this.bar.height);

    // some simple colour changing to make it look like a health bar
    if (this.barProgress < 32) {
        this.bar.context.fillStyle = '#f00';
    } else if (this.barProgress < 64) {
        this.bar.context.fillStyle = '#ff0';
    } else {
        this.bar.context.fillStyle = '#0f0';
    }

    // draw the bar
    this.bar.context.fillRect(0, 0, this.barProgress, 8);
};

Survive.prototype.fire = function(target) {
    if (!this.alive) return;
    if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
        this.nextFire = this.game.time.now + this.fireRate;
        gunShot.play();
        var bullet = this.bullets.getFirstDead();
        bullet.reset(this.turret.x, this.turret.y);
        bullet.rotation = this.game.physics.arcade.moveToObject(bullet, target, 500);

        this.turret.animations.play('attack');
        this.turret.events.onAnimationComplete.add(function() {
            this.breath.play();
        }, this);
    }
}
Survive.prototype.kill = function() {
    this.alive = false;
    this.gameObj.kill();
    this.turret.kill();
    this.hp.kill();
    this.bar.context.fillRect(0, 0, 0, 8);
    this.grave.alpha = 1;
}

var game = new Phaser.Game(1024, 768, Phaser.CANVAS, 'shooting-game', {
    preload: preload,
    create: eurecaClientSetup,
    update: update,
    render: render
});

function preload() {

    game.load.audio('07', 'assets/07.mp3');
    game.load.audio('gunShot', 'assets/gun-shot.mp3');
    game.load.audio('zombieRoar', 'assets/zombie-roar.wav');
    game.load.audio('zombieAttack', 'assets/zombie-attack.wav');
    game.load.image('shadow', 'assets/shadow.png');
    game.load.image('logo', 'assets/logo.png');
    game.load.spritesheet('player', 'assets/player.png', 107, 70, 23);
    game.load.spritesheet('zombie', 'assets/zombie.png', 90, 97, 26);
    game.load.image('grave', 'assets/grave.png', 50, 50);
    // game.load.image('zombie1', 'assets/zombie1.png',71,71);
    game.load.image('bullet', 'assets/bullet.png');
    game.load.image('grass', 'assets/dark_grass.png');
    //game.load.spritesheet('kaboom1', 'assets/explosion.png', 64, 64, 23);
    game.load.spritesheet('kaboom', 'assets/blood.png', 150, 150, 6);
    game.load.image('potion', 'assets/potion.png', 64, 64);
    game.load.image('shoes', 'assets/shoes.png', 64, 64);
    game.load.spritesheet('burst', 'assets/burst.png', 64, 64, 60);
    game.load.spritesheet('rain', 'assets/rain.png', 17, 17);
    game.load.spritesheet('bulletSpeed', 'assets/bullet-speed.png', 64, 64);

    key1 = game.input.keyboard.addKey(Phaser.Keyboard.ONE);
    key1.onDown.add(startGame, this);

}

function startGame() {
    // console.log('1111111');
    // console.log('SPAWN ZOMBIE');
    // var tnk1 = new EnemyZombie("zzzzombie1", game,myId);
    // zombieList["zzzzombie1"] = tnk1;
    // this.eurecaClientSetup.addZombie(1, 0, 0, myId)
    if (gameStart == true) return;
    eurecaServer.begin();
    zombieRoar.play();
}


function create() {

    //  Resize our game world to be a 2000 x 2000 square
    bgm = game.add.audio('07', 1, true);
    gunShot = game.add.audio('gunShot', -0.5);
    zombieRoar = game.add.audio('zombieRoar');
    zombieAttack = game.add.audio('zombieAttack');
    bgm.play();
    game.world.setBounds(-100, -100, 2000, 2000);
    game.stage.disableVisibilityChange = true;

    //  Our tiled scrolling background
    land = game.add.tileSprite(0, 0, 1024, 768, 'grass');
    land.fixedToCamera = true;
    var emitter = game.add.emitter(game.world.centerX, -100, 400);

    emitter.width = game.world.width;
    // emitter.angle = 30; // uncomment to set an angle for the rain.

    emitter.makeParticles('rain');

    emitter.minParticleScale = 0.1;
    emitter.maxParticleScale = 0.8;
    emitter.alpha = 0.6;
    emitter.setYSpeed(800, 1200);
    emitter.setXSpeed(-5, 5);

    emitter.minRotation = 0;
    emitter.maxRotation = 0;

    emitter.start(false, 1600, 0, 0);


    playersList = {};
    zombieList = {};
    itemList = {};

    player = new Survive(myId, game, gameObj);
    playersList[myId] = player;
    gameObj = player.gameObj;
    turret = player.turret;
    gameObj.x = 0;
    gameObj.y = 0;
    bullets = player.bullets;
    localZombie = player.localZombie;
    shadow = player.shadow;

    //  Explosion pool
    explosions = game.add.group();

    for (var i = 0; i < 10; i++) {
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

function removeLogo() {
    //game.input.onDown.remove(removeLogo, this);
    logo.kill();
}

function update() {
    if (!ready) return;
    //master client press 1, gamestart
    if (Object.keys(zombieList).length > 0) {
        gameStart = true;
        removeLogo();
    }
    //console.log(Object.keys(zombieList).length);
    if (Object.keys(zombieList).length == 0 && gameStart == true) {
        gameStart = false;
        addLogo();
    }
    //console.log(myId + zombieID++);
    player.input.left = cursors.left.isDown;
    player.input.right = cursors.right.isDown;
    player.input.up = cursors.up.isDown;
    player.input.down = cursors.down.isDown;
    player.input.fire = game.input.activePointer.leftButton.isDown;
    // player.input.addZombie = game.input.activePointer.middleButton.isDown;
    player.input.addZombie = game.input.activePointer.rightButton.isDown;
    player.input.tx = game.input.x + game.camera.x;
    player.input.ty = game.input.y + game.camera.y;


    turret.rotation = game.physics.arcade.angleToPointer(turret);
    land.tilePosition.x = -game.camera.x;
    land.tilePosition.y = -game.camera.y;

    for (var i in playersList) {
        if (!playersList[i]) continue;
        var curBullets = playersList[i].bullets;
        //var curZombie = playersList[i].localZombie;
        var curSurvive = playersList[i].gameObj;
        for (var j in zombieList) {
            if (!zombieList[j]) continue;
            // if (j!=i) 
            // {
            var targetSurvive = zombieList[j].gameObj;
            //debugObj = playersList[j];
            //console.log(targetSurvive);
            //killtest = j;
            //console.log(playersList[j].gameObj);
            //game.physics.arcade.OVERLAP_BIAS = 5;
            // game.physics.arcade.overlap(zombieList[j].item,curSurvive,pickupItem,null,this);

            game.physics.arcade.collide(zombieList[j].gameObj, curSurvive, zombieATK, null, this);
            //game.physics.arcade.collide(curBullets, targetSurvive,bulletHitPlayer,null,this);
            game.physics.arcade.overlap(playersList[i].bullets, zombieList[j].gameObj, bulletHitPlayer, null, this);



            //game.debug.geom(playersList[j].gameObj, 'rgb(0,255,0)');
            // }

            if (j in zombieList) {
                if (zombieList[j].alive) {
                    zombieList[j].update();
                    for (var k in zombieList) {
                        game.physics.arcade.collide(zombieList[j].gameObj, zombieList[k].gameObj);
                    }
                }
            }

        }
        for (var k in itemList) {
            // console.log(itemList[k]);
            game.physics.arcade.overlap(itemList[k], curSurvive, pickupItem, null, this);
        }
        if (playersList[i].alive) {
            if (playersList[i].health < 0) {
                playersList[i].kill();
            }
            playersList[i].update();
        }
        // game.physics.arcade.collide(this.zombieList, this.zombieList);      
    }
}

function pickupItem(item, player) {
    console.log(item);
    if (item.key == "potion") {
        if (playersList[player.id].health > 900) {
            playersList[player.id].health = 1000;
        } else {
            playersList[player.id].health += 100;
        }
    } else if (item.key == "shoes") {
        playersList[player.id].speed += 50;
    } else if (item.key == "bulletSpeed") {
        playersList[player.id].fireRate -= 50;
    } else {}
    item.kill();
    item.burst.kill();
    // console.log(player);

}

function zombieATK(zombie, player) {
    zombieList[zombie.id].turret.animations.play('attack', 15, false);
    zombieAttack.play();
    zombieList[zombie.id].turret.events.onAnimationComplete.add(function() {
        playersList[player.id].health--;
    }, this);
    zombieList[zombie.id].turret.events.onAnimationComplete.add(function() {
        zombieList[zombie.id].walk.play();
    }, this);


    // player.gameObj.health--;
}

function te(gameObj) {
    console.log("over");
    var explosionAnimation = explosions.getFirstExists(false);
    explosionAnimation.reset(gameObj.x, gameObj.y);
    explosionAnimation.play('kaboom', 30, false, true);
}

function bulletHitPlayer(gameObj, bullet) {

    //console.log(gameObj);
    //game.debug.bodyInfo(debugObj, 32, 32);
    //game.debug.geom(targetSurvive, 'rgb(0,255,0)');
    bullet.kill();
    // console.log(zombieList[gameObj.id].health);
    if (!zombieList[gameObj.id]) return;
    if (zombieList[gameObj.id].health > 0) {
        zombieList[gameObj.id].health--;
    } else {
        if (zombieList[gameObj.id].item) {
            itemList[itemID++] = zombieList[gameObj.id].item;
        }
        zombieList[gameObj.id].kill();
        delete zombieList[gameObj.id];
    }
    // zombieList[gameObj.id].kill();
    var explosionAnimation = explosions.getFirstExists(false);
    explosionAnimation.reset(gameObj.x, gameObj.y);
    explosionAnimation.play('kaboom', 30, false, true);

}

function render() {
    //game.debug.geom(point, 'rgb(0,255,0)');
    if (!ready) return;
    //game.debug.spriteBounds(playersList[myId].gameObj, 'rgb(0,255,0)',true);
    // for (var i in playersList) {
    // game.debug.text('HP: ' + playersList[i].health + '/1000', playersList[i].gameObj.x + 35, playersList[i].gameObj.y + 50);
    // game.debug.text(playersList[i].gameObj.x,playersList[i].gameObj.x + 50, playersList[i].gameObj.y + 30);
    // game.debug.text(playersList[i].gameObj.y,playersList[i].gameObj.x + 50, playersList[i].gameObj.y + 50);

    //game.debug.spriteBounds(playersList[i].gameObj);
    // game.debug.body(playersList[i].bullets);
    // game.debug.bodyInfo(playersList[i].bullets);

    // }
    // for (var j in zombieList)
    // {
    // game.debug.body(zombieList[j]);
    // game.debug.bodyInfo(zombieList[j]);
    // game.debug.spriteInfo(zombieList[j].gameObj,32,32);
    // game.debug.spriteBounds(zombieList[j].gameObj);
    // game.debug.spriteBounds(zombieList[j].gameObj,'rgb(0,255,0)',true);
    // }
    // for (var k in itemList){
    // game.debug.spriteBounds(itemList[k]);
    // }
}