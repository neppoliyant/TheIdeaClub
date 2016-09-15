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
		res.header("Access-Control-Allow-Origin", "*");
  		res.header("Access-Control-Allow-Headers", "X-Requested-With");
	    jcp.putJCP(req, res);
	});

	app.post('/ideaClub/jcp', function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
  		res.header("Access-Control-Allow-Headers", "X-Requested-With");
	    jcp.postJCP(req, res);     
	});

	app.put('/ideaClub/deletejcp', function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
  		res.header("Access-Control-Allow-Headers", "X-Requested-With");
	    jcp.deleteJCP(req, res);     
	});

	app.post('/ideaClub/addparticipants', function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
  		res.header("Access-Control-Allow-Headers", "X-Requested-With");
	    jcp.addParticipants(req, res);     
	});

	app.put('/ideaClub/deleteparticipants', function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
  		res.header("Access-Control-Allow-Headers", "X-Requested-With");
	    jcp.deleteParticipants(req, res);     
	});

	return app;
}();