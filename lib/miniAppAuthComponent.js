'use strict';

var urllib = require('urllib');
var extend = require('util')._extend;

var MiniAppAuthComponent = function (appid, componentAppId, componentAccessToken) {
  this.appid = appid;
  this.componentAppId = componentAppId;
  this.componentAccessToken = componentAccessToken;
  this.defaults = {};
};

MiniAppAuthComponent.prototype.getOpenId = function (code, callback) {
  var url = 'https://api.weixin.qq.com/sns/component/jscode2session';
  var info = {
    appid: this.appid,
    js_code: code,
    grant_type: 'authorization_code',
    component_appid: this.componentAppId,
    component_access_token: this.componentAccessToken,
  };

  var args = {
    data: info,
    dataType: 'json'
  };
  this.request(url, args, function (err, result) {
    if (!result && !result.openid){
      callback(err);
    }
    else{
      callback(null, result);
    }
  });
};

MiniAppAuthComponent.prototype.request = function (url, opts, callback) {
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

exports.MiniAppAuthComponent = MiniAppAuthComponent;