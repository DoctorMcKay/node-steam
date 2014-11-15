var Steam = require('../steam_client');
var SteamID = require('../steamID');

var EMsg = Steam.EMsg;
var schema = Steam.Internal;

var protoMask = 0x80000000;


// Methods

var prototype = Steam.SteamClient.prototype;

prototype.getGameServers = function(conditions, callback) {
  if(typeof conditions === 'function') {
    callback = conditions;
    conditions = {};
  }
  
  if(typeof callback !== 'function') {
    throw new Error("No callback parameter provided to getGameServers");
  }
  
  var msg = {
    "appId": conditions.appid || undefined,
    "regionCode": conditions.region || undefined,
    "filterText": conditions.filters || undefined,
    "maxServers": conditions.maximum || 5000
  };
  
  this._send(EMsg.ClientGMSServerQuery | protoMask, schema.CMsgClientGMSServerQuery.serialize(msg), callback);
};


// Handlers

var handlers = prototype._handlers;

handlers[EMsg.GMSClientServerQueryResponse] = function(data, callback) {
  var response = schema.CMsgGMSClientServerQueryResponse.parse(data);
  if(response.error) {
    callback(response.error);
    return;
  }
  
  var servers = (response.servers || []).map(function(server) {
    return {
      "ip": (server.serverIp >> 24 & 0xFF) + '.' + (server.serverIp >> 16 & 0xFF) + '.' + (server.serverIp >> 8 & 0xFF) + '.' + (server.serverIp & 0xFF),
      "port": server.serverPort,
      "players": server.authPlayers
    };
  });
  
  callback(null, servers);
};