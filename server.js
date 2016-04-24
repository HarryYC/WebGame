var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);
var zombieID = 0;


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

eurecaServer.exports.handleKeys = function (keys) {
	var conn = this.connection;
	var updatedClient = clients[conn.id];
  //spawn zombie randomly at position x,y
  var x = Math.floor((Math.random() * 500) + 1);
  var y = Math.floor((Math.random() * 500) + 1);
  //set zombies target to random player
  var randomPlayer = Math.floor(Math.random() * Object.keys(clients).length);

  //console.log(randomPlayer);
	for (var c in clients)
	{
	var remote = clients[c].remote;
  if (keys.addZombie == true){
    
    remote.spawnZombie(zombieID++, x, y, clients[Object.keys(clients)[randomPlayer]].id);
  }
		remote.updateState(updatedClient.id, keys);
		clients[c].laststate = keys;
	}
}

server.listen(8000);