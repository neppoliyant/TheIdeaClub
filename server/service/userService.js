module.exports = function() {
    var express = require('express');
    var app = express();
    var methodOverride = require('method-override');
    var user = require('../controller/userController');
    var logger = require('morgan');
    var bodyParser = require('body-parser');
    app.use(bodyParser());
    app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
    app.use(logger());
    app.use(methodOverride('_method'));
    


	app.put('/ideaClub/user/:id', function(req, res) {
		res.header("Access-Control-Allow-Origin", "*");
  		res.header("Access-Control-Allow-Headers", "X-Requested-With");
	    user.getUser(req, res);
	});

	app.put('/ideaClub/userUpdate/:id', function(req, res) {
		res.header("Access-Control-Allow-Origin", "*");
  		res.header("Access-Control-Allow-Headers", "X-Requested-With");
	    user.UpdateUserCas(req, res);
	});

	app.post('/ideaClub/user/:id', function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
  		res.header("Access-Control-Allow-Headers", "X-Requested-With");
	    user.addUser(req, res);     
	});

	app.delete('/ideaClub/user/:uid', function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
  		res.header("Access-Control-Allow-Headers", "X-Requested-With");
	    user.deleteUser(req, res);     
	});

	return app;
}();