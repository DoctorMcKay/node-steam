var ByteBuffer = require('bytebuffer');
var Steam = require('../steam_client');

var EMsg = Steam.EMsg;
var EResult = Steam.EResult;
var schema = Steam.Internal;

var protoMask = 0x80000000;


// Methods

var prototype = Steam.SteamClient.prototype;

prototype.getNumberOfCurrentPlayers = function(appID, callback) {
  this._send(EMsg.ClientGetNumberOfCurrentPlayersDP | protoMask, new schema.CMsgDPGetNumberOfCurrentPlayers({"appid": appID}), callback);
};


// Handlers

var handlers = prototype._handlers;

handlers[EMsg.ClientGetNumberOfCurrentPlayersDPResponse] = function(data, callback) {
  var proto = schema.CMsgDPGetNumberOfCurrentPlayersResponse.decode(data);
  callback(proto.eresult, proto.playerCount);
};