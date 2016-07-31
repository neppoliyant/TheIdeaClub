var url = require('url');
var constructErrorMessage = require('../utils/appUtils').constructErrorMessage;
var constructSuccessMessage = require('../utils/appUtils').constructSuccessMessage;
var db = require('../dao/db');
var utils = require('../utils/appUtils');
var fs = require('fs');
var config = require('../config/config.js');
var logger = require('../log/winston');
var auditlogRes = require('../log/auditlog').auditlogNew;
var nodemailer = require('nodemailer');
var cassandra = require('cassandra-driver');
var async = require('async');
var authProvider = new cassandra.auth.PlainTextAuthProvider('cassandra', 'cassandra');
var uuid = require('node-uuid');
var geocoder = require('node-geocoder')('google', 'http', null);
var TimeUuid = require('cassandra-driver').types.TimeUuid;
var crypto = require('crypto');
var smtpTransport = require("nodemailer-smtp-transport");

var smpttransporter = nodemailer.createTransport("SMTP", {
service: "Gmail",
auth: {
    user: config.smptAuth.user,
    pass: config.smptAuth.pass
}
});

var client = new cassandra.Client({contactPoints: [config.cassandraDB], keyspace: config.cassandraKeySpace});

function postJCP(req, res) {
	var query = '';
    var params = [];
    var articleID = TimeUuid.fromDate(new Date());
    query = 'insert into articles (articleid, title, authorname, uid, firstname, topic, keywords, presentationtime, format, active) values(?,?,?,?,?,?,?,?,?);';
    var body = req.body;
    params = [articleID, body.title, body.authorname, body.uid, body.firstname, body.topic, body.keywords, body.presentationtime, body.format, 'YES'];

    client.execute(query, params,{ prepare: true}, function(err, result) {
        if (err) {
            res.statusCode = 500;
            res.send(errorMsg(err, 500));
            auditlogRes(req, 500, err);
        } else {
            var keywordsSpilt = body.keywords.split(' ');
            var queries = [];
            for (i = 0; i < keywordsSpilt.length; i++) { 
			    var keyword += keywordsSpilt[i];
			    var obj = {};
			    obj.query = 'insert into keyword_search (keyword, articleid) values(?,?);';

			    obj.params = [articleID, body.title];
			    queries.push(obj);
			}

			client.batch(queries, { prepare: true}, function(err) {
			 console.log('Data updated on DB');
			});

			var output = {};
			output.message = "Success";
			output.articleId = articleID;

			res.statusCode = 200;
            res.send(output);
            auditlogRes(req, 200, successMessage("post JCP Successful", 200));
        }
    });
}

function putJCP(req, res) {
	var query = '';
    var params = [];
    var articleID = req.body.articleID;
    query = 'update articles set title=?, authorname=?, uid=?, firstname=?, topic=?, keywords=?, presentationtime=?, format=? where articles=?;';
    var body = req.body;
    params = [body.title, body.authorname, body.uid, body.firstname, body.topic, body.keywords, body.presentationtime, body.format, articleID];

    client.execute(query, params,{ prepare: true}, function(err, result) {
        if (err) {
            res.statusCode = 500;
            res.send(errorMsg(err, 500));
            auditlogRes(req, 500, err);
        } else {
            var keywordsSpilt = body.keywords.split(' ');
            var queries = [];
            for (i = 0; i < keywordsSpilt.length; i++) { 
			    var keyword += keywordsSpilt[i];
			    var obj = {};
			    obj.query = 'insert into keyword_search (keyword, articleid) values(?,?);';

			    obj.params = [articleID, body.title];
			    queries.push(obj);
			}

			var obj = {};
		    obj.query = 'insert into room_article (roomid, uid, participants) values(?,?,?);';

		    obj.params = [articleID, body.uid, body.uid];
		    queries.push(obj);
			client.batch(queries, { prepare: true}, function(err) {
			 console.log('Data updated on DB');
			});

			var output = {};
			output.message = "Success";
			output.articleId = articleID;

			res.statusCode = 200;
            res.send(output);
            auditlogRes(req, 200, successMessage("update JCP Successful", 200));
        }
    });
}

function deleteJCP(req, res) {
	var query = '';
    var params = [];
    var articleID = req.body.articleID;
    query = 'update articles set active where articles=?;';
    var body = req.body;
    params = [body.title, body.authorname, body.uid, body.firstname, body.topic, body.keywords, body.presentationtime, body.format, articleID];

    client.execute(query, params,{ prepare: true}, function(err, result) {
        if (err) {
            res.statusCode = 500;
            res.send(errorMsg(err, 500));
            auditlogRes(req, 500, err);
        } else {
			var output = {};
			output.message = "Success";
			output.articleId = articleID;

			res.statusCode = 200;
            res.send(output);
            auditlogRes(req, 200, successMessage("delete JCP Successful", 200));
        }
    });
}

function addParticipants(req, res) {
	var query = '';
    var params = [];
    var articleID = req.body.articleID;
    query = 'select uid from users where email=?';
    var body = req.body;
    params = [body.email];

    client.execute(query, params,{ prepare: true}, function(err, result) {
        if (err) {
            res.statusCode = 500;
            res.send(errorMsg(err, 500));
            auditlogRes(req, 500, err);
        } else {
            if (result.rows.length > 0) {
                var uid = result.rows[0].uid;
                
                query = 'insert into room_article (roomid, uid, participants) values(?,?,?);';

		    	params = [articleID, body.uid, uid];

		    	client.execute(query, params,{ prepare: true}, function(err, result) {
		    		var obj ={};
		    		obj.message = "Success";

		    		res.statusCode = 200;
	                res.send(obj);
	                auditlogRes(req, 200, successMessage("Participants added Successfully", 200));
		    	});
            } else {
                res.statusCode = 404;
                res.send(errorMsg("Not a vaild user", 404));
                auditlogRes(req, 404, "Not a vaild user");
                sendEmail(body.email);
            }
        }
    });
}

function deleteParticipants(req, res) {
	var query = '';
    var params = [];
    query = 'delete from room_article where roomid=?, uid=?, participants=?';
    var body = req.body;
    params = [body.articleID, body.uid, body.participantID];

    client.execute(query, params,{ prepare: true}, function(err, result) {
        if (err) {
            res.statusCode = 500;
            res.send(errorMsg(err, 500));
            auditlogRes(req, 500, err);
        } else {
            var obj ={};
    		obj.message = "Success";

    		res.statusCode = 200;
            res.send(obj);
            auditlogRes(req, 200, successMessage("Participants deleted Successfully", 200));
        }
    });
}

function sendEmail(to) {
    var msg = 'To attend the JCP, please register to The Idea Club';
    var mailOptions = {
        from: 'neppoliyant@gmail.com', // sender address
        to: to, // list of receivers
        subject: 'Register for ideaclub', // Subject line
        text: msg, // plaintext body
        html: '<b>Welcome to ideaclub</b> </br> </br><b> ' + msg + '</b>' // html body
    };

    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            return;
        }
    });
}

module.exports.postJCP = postJCP;
module.exports.putJCP = putJCP;
module.exports.deleteJCP = deleteJCP;
module.exports.addParticipants = addParticipants;
module.exports.deleteParticipants = deleteParticipants;





