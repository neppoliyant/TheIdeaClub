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
var clientTwilio = require('twilio')(config.accountSid, config.authToken);

var client = new cassandra.Client({contactPoints: [config.cassandraDB], keyspace: config.cassandraKeySpace});

var smpttransporter = nodemailer.createTransport("SMTP", {
service: "Gmail",
auth: {
    user: config.smptAuth.user,
    pass: config.smptAuth.pass
}
});

var sendSms = function(to, message) {
  clientTwilio.messages.create({
    body: message,
    to: to,
    from: config.sendingNumber
  }, function(err, data) {
    if (err) {
      console.error('Could not notify administrator');
      console.error(err);
    } else {
      console.log('Administrator notified');
    }
  });
};


var transporter = nodemailer.createTransport(smtpTransport({
    host : "smtp.gmail.com",
    secureConnection : false,
    port: 587,
    auth : {
        user: config.smptAuth.user,
        pass: config.smptAuth.pass
    }
}));


function addUser(req, res) {
    var query = '';
    var params = [];

    query = 'select * from users where email = ?;';
    console.log(req.body.email);
    params = [req.body.email];

    client.execute(query, params, function(err, result) {
        if (err) {
            res.statusCode = 500;
            res.send(errorMsg(err, 500));
            auditlogRes(req, 500, err);
        } else {
            if (result.rows.length > 0) {
                res.statusCode = 404;
                res.send(errorMsg("User Already Exist", 404));
                auditlogRes(req, 404, "User Already Exist");
            } else {
                var verificationCode = randomValueHex(6);

                query = 'insert into users(uid, email, firstname, lastname, password, createdtime, verificationcode, verified, institution, phonenumber) values(?,?,?,?,?,?,?,?,?,?);';

                var uuid5 = TimeUuid.fromDate(new Date());
                req.body.uid = uuid5;

                params = [uuid5.toString(), req.body.email, req.body.firstname, req.body.lastname, req.body.password, req.body.createdTime, verificationCode, "false", req.body.institution, req.body.phoneNumber];
                client.execute(query, params,{ prepare: true}, function(err) {
                  if (err) {
                    res.statusCode = 500;
                    console.log(err);
                    res.send(errorMsg(err, 500));
                    auditlogRes(req, 500, err);
                  } else {
                    var msg = 'The Idea Club Verification. Please enter the code to verify account : ' + verificationCode;
                    sendEmailLastNyte(req.body.email, verificationCode);
                    sendSms(req.body.phoneNumber, msg);
                    res.statusCode = 200;
                    res.send(req.body);
                    auditlogRes(req, 200, successMessage("Success Inserting of data", 200));
                  }
                });
            }
        }
    });
}

function randomValueHex (len) {
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') 
        .slice(0,len);   
}

function deleteUser(req, res) {
    var query = '';
    var params = [];

    query = 'delete from users where uid = ?;';

    params = [req.params.uid];

    client.execute(query, params, { prepare: true}, function(err, result) {
        if (err) {
            res.statusCode = 500;
            res.send(errorMsg(err, 500));
            auditlogRes(req, 500, err);
        } else {
            res.statusCode = 200;
            res.send(successMessage("Deleted User", 200));
            auditlogRes(req, 200, successMessage("Deleted User", 200));
        }
    });
}

function verificationUser(req, res) {
    var query = 'select * from users where uid = ?;';

    var params = [req.params.uid];

    client.execute(query, params,{ prepare: true}, function(err, result) {
      if (err) {
        res.statusCode = 500;
        res.send(errorMsg(err, 500));
        auditlogRes(req, 500, err);
      } else {
        var obj = {};
        if (result.rows[0]) {
            if (result.rows[0].verificationcode == req.query.code) {
                query = 'update users set verified = ? where uid = ? and email = ?';
                params = ['true', req.params.uid, result.rows[0].email];
                client.execute(query, params,{ prepare: true}, function(err, result) {
                    if (err) {
                        res.statusCode = 500;
                        res.send(errorMsg(err, 500));
                        auditlogRes(req, 500, err);
                    } else {
                        res.statusCode = 200;
                        obj.verified = "true";
                        res.send(obj);
                        auditlogRes(req, 200, successMessage("Success Verification of data", 200));
                    }
                });
            } else {
                res.statusCode = 400;
                res.send(errorMsg("Not a valid code", 400));
                auditlogRes(req, 400, "Not a valid code");
            }
        } else {
            res.statusCode = 404;
            res.send(errorMsg("No User Found", 404));
            auditlogRes(req, 404, "No User Found");
        }
      }
    });
}

function getUser(req, res) {
    var query = 'select * from users where email = ? and password= ? ALLOW FILTERING';

    var uuid5 = uuid.v4();
    var params = [req.body.email, req.body.password];
    client.execute(query, params, function(err, result) {
      if (err) {
        res.statusCode = 500;
        res.send(errorMsg(err, 500));
        auditlogRes(req, 500, err);
      } else {
        var obj = {};
        if (result.rows[0]) {
            obj.firstName = result.rows[0].firstname;
            obj.lastName = result.rows[0].lastname;
            obj.email = result.rows[0].email;
            obj.uid = result.rows[0].uid;
            obj.verified = result.rows[0].verified;
            obj.tracktime = result.rows[0].tracktime;
            res.statusCode = 200;
            res.send(obj);
            auditlogRes(req, 200, successMessage("Success getting of user details", 200));
        } else {
            res.statusCode = 404;
            res.send(errorMsg("No User Found", 404));
            auditlogRes(req, 500, "No User Found");
        }
      }
    });
}

function UpdateUserCas(req, res) {
    var query = '';
    var params = [];

    query = 'select * from users where uid=?;';
    console.log(req.params.id);
    params = [req.params.id];

    client.execute(query, params, { prepare: true}, function(err, result) {
        if (err) {
            res.statusCode = 500;
            res.send(errorMsg(err, 500));
            auditlogRes(req, 500, err);
        } else {
            if (result.rows.length > 0) {

                query = 'update users set firstName=?, lastname=?, password=? where uid=? and email=?';

                params = [req.body.firstname, req.body.lastname, req.body.password, req.params.id, req.body.email];

                client.execute(query, params, { prepare: true}, function(err) {
                  if (err) {
                    res.statusCode = 500;
                    res.send(errorMsg(err, 500));
                    auditlogRes(req, 500, err);
                  } else {
                    req.body.msg = 'Updated Successfully';
                    res.statusCode = 200;
                    res.send(req.body);
                    auditlogRes(req, 200, successMessage("Updated user details in cassandra", 200));
                  }
                });
            } else {
                res.statusCode = 404;
                res.send(errorMsg("User Not Found", 404));
                auditlogRes(req, 404, errorMsg("User Not Found", 404));
            }
        }
    });
}

function errorMsg(errorMsg, statusCode) {
    var obj = {};
    obj.status = statusCode;
    obj.hasError = true;
    obj.message = errorMsg;
    return obj;
}

function successMessage(msg, statusCode) {
    var obj = {};
    obj.status = statusCode;
    obj.hasError = false;
    obj.message = msg;
    return obj;
}

function sendEmailLastNyte(to, code) {
    var msg = 'Please enter the code to verify account : ' + code;
    var mailOptions = {
        from: 'neppoliyant@gmail.com', // sender address
        to: to, // list of receivers
        subject: 'Verification for ideaclub', // Subject line
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


module.exports.deleteUser = deleteUser;
module.exports.getUser = getUser;
module.exports.addUser = addUser;
module.exports.UpdateUserCas = UpdateUserCas;

