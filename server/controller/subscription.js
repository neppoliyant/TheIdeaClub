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
var smtpTransport = require("nodemailer-smtp-transport")

var client = new cassandra.Client({contactPoints: [config.cassandraDB], keyspace: config.cassandraKeySpace});

//Notification Methods

function getSubscription(req, res) {
    var query = '';
    var params = [];

    query = 'select * from usersdevicedetails where uid = ? and devicetoken = ?;';

    params = [req.params.uid, req.params.id];

    client.execute(query, params,{ prepare: true}, function(err, result) {
        if (err) {
            res.statusCode = 500;
            res.send(errorMsg(err, 500));
            auditlogRes(req, 500, err);
        } else {
            if (result.rows.length > 0) {
                var obj = {};
                obj.uid = result.rows[0].uid;
                obj.deviceType = result.rows[0].devicetype;
                obj.deviceToken = result.rows[0].devicetoken;
                obj.notification = result.rows[0].notification
                res.statusCode = 200;
                res.send(obj);
                auditlogRes(req, 200, successMessage("Get Subscription Successful", 200));
            } else {
                res.statusCode = 404;
                res.send(errorMsg("No Record Found", 404));
                auditlogRes(req, 404, "No Notification Record Found");
            }
        }
    });
}

function putSubscription(req, res) {
    var query = '';
    var params = [];

    query = 'insert into usersdevicedetails(uid, devicetoken, devicetype, notification, email) values(?,?,?,?,?);';
    console.log('request body' + JSON.stringify(req.body));
    console.log('request uid' + req.body.uid);
    params = [req.body.uid, req.body.deviceToken, req.body.deviceType, req.body.notification, req.body.email];

    client.execute(query, params,{ prepare: true}, function(err, result) {
        if (err) {
            res.statusCode = 500;
            res.send(errorMsg(err, 500));
            auditlogRes(req, 500, err);
        } else {
            res.statusCode = 200;
            res.send(successMessage("Success", 200));
            auditlogRes(req, 200, successMessage("Put Subscription Successful", 200));
        }
    });
}

function deleteSubscription(req, res) {
    var query = '';
    var params = [];

    query = 'delete from usersdevicedetails where uid =? and devicetoken = ?;';

    params = [req.params.uid, req.params.id];

    client.execute(query, params,{ prepare: true}, function(err, result) {
        if (err) {
            res.statusCode = 500;
            res.send(errorMsg(err, 500));
            auditlogRes(req, 500, err);
        } else {
            res.statusCode = 200;
            res.send(successMessage("Success Delete of record", 200));
            auditlogRes(req, 200, successMessage("Delete Subscription Successful", 200));
        }
    });
}

module.exports.deleteSubscription = deleteSubscription;
module.exports.putSubscription = putSubscription;
module.exports.getSubscription = getSubscription;