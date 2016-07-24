module.exports = function() {
    var express = require('express');
    var app = express();
    var methodOverride = require('method-override');
    var subscription = require('../controller/subscription');
    var logger = require('morgan');
    var bodyParser = require('body-parser');
    app.use(bodyParser());
    app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
    app.use(logger());
    app.use(methodOverride('_method'));
    
	//Mobile Notification
	app.get('/ideaClub/subscription/:id/:uid', function(req, res, next) {
	    subscription.getSubscription(req, res);
	});

	app.put('/ideaClub/subscription/:id/:uid', function(req, res, next) {
	    subscription.putSubscription(req, res);
	});

	app.delete('/ideaClub/subscription/:id/:uid', function(req, res, next) {
	    subscription.deleteSubscription(req, res);
	});

	return app;

}();