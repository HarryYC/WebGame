var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);

var zombieID = 0;
var gamestart = false;
var x = [];
var y = [];
var randomPlayer = [];

app.use(express.static(__dirname));

var EurecaServer = require('eureca.io').EurecaServer;
var eurecaServer = new EurecaServer({allow:['setId', 'spawnPlayer','spawnZombie', 'kill', 'updateState']});
var clients = {};
eurecaServer.attach(server);

eurecaServer.onConnect(function (conn){
  console.log('New Client id=%s ', conn.id, conn.remoteAddress);
  var remote = eurecaServer.getClient(conn.id);    
  clients[conn.id] = {id:conn.id, remote:remote}
  remote.setId(conn.id);	
  //console.log(clients[Object.keys(clients)[0]].id);    

});

eurecaServer.onDisconnect(function (conn){
  console.log('Client disconnected ', conn.id);
  var removeId = clients[conn.id].id;
	
	delete clients[conn.id];
	
	for (var c in clients)
	{
		var remote = clients[c].remote;
		
		remote.kill(conn.id);
	}
});


eurecaServer.exports.handshake = function()
{
	for (var c in clients)
	{
		var remote = clients[c].remote;
		for (var cc in clients)
		{		
      var x = clients[cc].laststate ? clients[cc].laststate.x:  0;
			var y = clients[cc].laststate ? clients[cc].laststate.y:  0;
      remote.spawnPlayer(clients[cc].id, 120, 120);		
		}
	}
}

eurecaServer.exports.begin = function()
{
  console.log("call zombies from clients");
  initZombie();
  	for (var c in clients)
	{
		var remote = clients[c].remote;
		//for (var cc in clients)
		//{
	    console.log(c);
      remote.spawnZombie(zombieID++, x[0], y[0], 
                      clients[Object.keys(clients)[randomPlayer[0]]].id);		
		//}
	}
}
 


eurecaServer.exports.handleKeys = function (keys) {
	var conn = this.connection;
	var updatedClient = clients[conn.id];

  
	for (var c in clients)
	{
	var remote = clients[c].remote;
  //console.log(gamestart);
  //console.log(Object.keys(clients).length);
	//start when player > 2
//  if (gamestart == false && Object.keys(clients).length > 1)
//  {
//    initZombie();
//    for (var i = 0; i < 10; i++)
//    {
//      remote.spawnZombie(zombieID++, x[i], y[i], 
//                         clients[Object.keys(clients)[randomPlayer[i]]].id);
//    }
//  }
  if (keys.addZombie == true){
    remote.spawnZombie(zombieID++, x[0], y[0], 
                       clients[Object.keys(clients)[randomPlayer[0]]].id);
  }
		remote.updateState(updatedClient.id, keys);
		clients[c].laststate = keys;
	}
  if (zombieID > 0){
    gamestart = true;
  }
}

function initZombie (){
  x = [];
  y = [];
  randomPlayer = [];
    for (var i = 0; i < 5; i++)
    {
      x.push(Math.floor((Math.random() * 660) + 1));
      y.push(400);
      randomPlayer.push(Math.floor(Math.random() * Object.keys(clients).length));
    }
  for (var i = 0; i < 5; i++)
    {
      x.push(-60);
      y.push(Math.floor((Math.random() * 460) + 1));
      randomPlayer.push(Math.floor(Math.random() * Object.keys(clients).length));
    }

  
}
server.listen(8000);
