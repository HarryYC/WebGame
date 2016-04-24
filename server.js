var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);
  
var zombieList;
var zombieID = 0;
// var count=30;
// var counter=setInterval(timer, 10000);

app.use(express.static(__dirname));

var EurecaServer = require('eureca.io').EurecaServer;
//var eurecaServer = new EurecaServer();
// var eurecaServer = new EurecaServer({allow:['setId', 'spawnPlayer', 'kill']});
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

eurecaServer.updateContract(function (conn){
  console.log('123123');
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
      //console.log(clients[Object.keys(clients)[0]].id);
      //**need to be changed to random		
      //remote.spawnZombie(1, x, y, clients[Object.keys(clients)[0]].id); 
		}
	}
}

eurecaServer.exports.handleKeys = function (keys) {
	var conn = this.connection;
	var updatedClient = clients[conn.id];

	for (var c in clients)
	{
	var remote = clients[c].remote;
  if (keys.addZombie == true){
    console.log(clients[Object.keys(clients)[0]].id);
    remote.spawnZombie(1, 222, 222, clients[Object.keys(clients)[0]].id)
  }
		remote.updateState(updatedClient.id, keys);
		
		clients[c].laststate = keys;
	}
}

server.listen(8000);