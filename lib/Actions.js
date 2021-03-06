"use strict";

var _ = require('underscore'),
    utils = require('./utilities'),
    request = require('request'),
    config = require('../config/config'),
    actions = require('../config/actions'),
    gis = require('g-i-s'),
    Q = require('q');

var BotActions = function(bot) {
    this.bot = bot;

    // Formatting messages ( This will apply if we send messages to non private channels by default )
    //https://api.slack.com/docs/formatting
    //https://api.slack.com/docs/attachments

    this.params = {
        as_user: true
    };
    // more information about additional params https://api.slack.com/methods/chat.postMessage
    // http://www.emoji-cheat-sheet.com
};

BotActions.prototype.help = function(options) {

    var params = options.params || this.params,
        data = options.data,
        help = null;
    _.each(actions, function(value, action) {
        if(action == "help") {
            return;
        }

        var message = "Say '" + value.keywords  + "' for " + value.description;
        this.bot.postMessage(data.channel, message, params);
    }.bind(this));
};

BotActions.prototype.userMentionedNorrisJoke = function(options) {

    var params = options.params || this.params;
    var data = options.data;

    request('http://api.icndb.com/jokes/random/', function (error, response, body) {
        var json = JSON.parse(body).value;
        if (!error && response.statusCode == 200) {
            this.bot.postMessage(data.channel, json.joke, params);
        }
    }.bind(this));

};

BotActions.prototype.imageMe = function(options) {
    var params = options.params || this.params,
      data = options.data,
      query = data.text.split('chuck image me')[1];

    this.getImageFromQuery(query).then(function(imageUrl) {
        this.bot.postMessage(data.channel, imageUrl, params);
    }.bind(this));
};

BotActions.prototype.pugBomb = function(options) {
    var params = options.params || this.params,
        config = options.config,
        data = options.data,
        amount = config.times;

    _(amount).times(function(key){
        this.getImageFromQuery('pug').then(function(imageUrl) {
            this.bot.postMessage(data.channel, imageUrl, params);
        }.bind(this));
    }.bind(this));
};

BotActions.prototype.planningPoker = function(options) {
    var params = options.params || this.params,
        data = options.data;
    this.bot.postMessage(data.channel, config.planningPokerUrl, params);
};

BotActions.prototype.blameUser = function(options) {
    var params = options.params || this.params,
      data = options.data,
      userName = data.text.split('chuck blame')[1];

    this.bot.postMessage(data.channel, "It's all" + userName + "'s fault", params);
};


BotActions.prototype.getImageFromQuery = function(query) {
    var deferred = Q.defer();
    gis(query, function(err, results) {
        if (err) {
            console.log(err);
            return;
        }

        var imageUrl = results[Math.floor(Math.random() * results.length) - 1];

        deferred.resolve(imageUrl);

    }.bind(this));

    return deferred.promise;
};



module.exports = BotActions;