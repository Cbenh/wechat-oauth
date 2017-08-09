'use strict';

var urllib = require('urllib');
var wrapper = require('./util').wrapper;
var extend = require('util')._extend;
var querystring = require('querystring');


var OAuthComponant = function (appid, componantAppId, componentAccessToken) {
  this.appid = appid;
  this.componantAppId = componantAppId;
  this.componentAccessToken = componentAccessToken;
  this.defaults = {};
};

var AccessToken = function (data) {
  if (!(this instanceof AccessToken)) {
    return new AccessToken(data);
  }
  this.data = data;
};

AccessToken.prototype.isValid = function () {
  return !!this.data.access_token && (new Date().getTime()) < (this.data.create_at + this.data.expires_in * 1000);
};

var processToken = function (that, callback) {
  var create_at = new Date().getTime();

  return function (err, data, res) {
    if (err) {
      return callback(err, data);
    }
    data.create_at = create_at;
    that.saveToken(data.openid, data, function (err) {
      callback(err, new AccessToken(data));
    });
  };
};

OAuthComponant.prototype.getAuthorizeURL = function (redirect, state, scope) {
  var url = 'https://open.weixin.qq.com/connect/oauth2/authorize';
  var info = {
    appid: this.appid,
    component_appid: this.componantAppId,
    redirect_uri: redirect,
    response_type: 'code',
    scope: scope || 'snsapi_base',
    state: state || ''
  };

  return url + '?' + querystring.stringify(info) + '#wechat_redirect';
};


OAuthComponant.prototype.getAccessToken = function (code, callback) {
  var url = 'https://api.weixin.qq.com/sns/oauth2/component/access_token';
  var info = {
    appid: this.appid,
    component_appid: this.componantAppId,
    component_access_token: this.component_access_token,
    code: code,
    grant_type: 'authorization_code'
  };
  var args = {
    data: info,
    dataType: 'json'
  };
  this.request(url, args, wrapper(processToken(this, callback)));
};

OAuthComponant.prototype.request = function (url, opts, callback) {
  var options = {};
  extend(options, this.defaults);
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  for (var key in opts) {
    if (key !== 'headers') {
      options[key] = opts[key];
    } else {
      if (opts.headers) {
        options.headers = options.headers || {};
        extend(options.headers, opts.headers);
      }
    }
  }
  urllib.request(url, options, callback);
};

module.exports = OAuthComponant;
exports.OAuthComponant = OAuthComponant;
