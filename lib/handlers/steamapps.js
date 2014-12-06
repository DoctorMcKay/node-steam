var Steam = require('../steam_client');

var EMsg = Steam.EMsg;
var schema = Steam.Internal;

var protoMask = 0x80000000;


// Methods

var prototype = Steam.SteamClient.prototype;

prototype.picsGetChangesSince = function(lastChangeNumber, sendAppChangelist, sendPackageChangelist, callback) {
  this._send(EMsg.PICSChangesSinceRequest | protoMask, schema.CMsgClientPICSChangesSinceRequest.serialize({
    sinceChangeNumber: lastChangeNumber,
    sendAppInfoChanges: sendAppChangelist,
    sendPackageInfoChanges: sendPackageChangelist
  }), callback);
};

prototype.picsGetProductInfo = function(apps, packages, callback) {
  apps = apps || [];
  packages = packages || [];
  
  var i;
  for(i = 0; i < apps.length; i++) {
    if(typeof apps[i] === 'number') {
      apps[i] = {"appid": apps[i]};
    }
  }
  
  for(i = 0; i < packages.length; i++) {
    if(typeof packages[i] === 'number') {
      packages[i] = {"packageid": packages[i]};
    }
  }
  
  this._send(EMsg.PICSProductInfoRequest | protoMask, schema.CMsgClientPICSProductInfoRequest.serialize({
    packages: packages,
    apps: apps
  }), callback);
};

prototype.picsGetAccessToken = function(apps, packages, callback) {
  this._send(EMsg.PICSAccessTokenRequest | protoMask, schema.CMsgClientPICSAccessTokenRequest.serialize({
    "packageids": packages || [],
    "appids": apps || []
  }), callback);
};


// Handlers

var handlers = prototype._handlers;

handlers[EMsg.PICSChangesSinceResponse] = function(data, callback) {
  var proto = schema.CMsgClientPICSChangesSinceResponse.parse(data);
  callback(proto);
};

handlers[EMsg.PICSProductInfoResponse] = function(data, callback) {
  var proto = schema.CMsgClientPICSProductInfoResponse.parse(data);
  var apps = {};
  (proto.apps || []).forEach(function(app) {
    apps[app.appid] = app;
    if(app.buffer) {
      app.data = require('vdf').parse(app.buffer.toString('utf8', 0, app.buffer.length - 1));
    }
  });
  
  var packages = {};
  (proto.packages || []).forEach(function(pkg) {
    packages[pkg.packageid] = pkg;
    if(pkg.buffer) {
      pkg.data = require('vdf').parse(pkg.buffer.toString('utf8', 0, pkg.buffer.length - 1));
    }
  });
  
  proto.apps = apps;
  proto.packages = packages;
  
  callback(proto);
};

handlers[EMsg.PICSAccessTokenResponse] = function(data, callback) {
  var proto = schema.CMsgClientPICSAccessTokenResponse.parse(data);
  var apps = {};
  (proto.appAccessTokens || []).forEach(function(app) {
    apps[app.appid] = app.accessToken
  });
  
  var packages = {};
  (proto.packageAccessTokens || []).forEach(function(pkg) {
    packages[pkg.packageid] = pkg.accessToken;
  });
  
  proto.appAccessTokens = apps;
  proto.packageAccessTokens = packages;
  callback(proto);
};
