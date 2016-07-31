module.exports = function() {
    var express = require('express');
    var app = express();
    var methodOverride = require('method-override');
    var jcp = require('../controller/jcpController');
    var logger = require('morgan');
    var bodyParser = require('body-parser');
    app.use(bodyParser());
    app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
    app.use(logger());
    app.use(methodOverride('_method'));
    
	app.put('/ideaClub/jcp', function(req, res) {
	    jcp.putJCP(req, res);
	});

	app.post('/ideaClub/jcp', function(req, res, next) {
	    jcp.postJCP(req, res);     
	});

	app.put('/ideaClub/deletejcp', function(req, res, next) {
	    jcp.deleteJCP(req, res);     
	});

	app.put('/ideaClub/addparticipants', function(req, res, next) {
	    jcp.addParticipants(req, res);     
	});

	app.put('/ideaClub/deleteparticipants', function(req, res, next) {
	    jcp.deleteParticipants(req, res);     
	});

	return app;
}();