var cassandra = require('cassandra-driver');
var authProvider = new cassandra.auth.PlainTextAuthProvider('cassandra', 'cassandra');
var TimeUuid = require('cassandra-driver').types.TimeUuid;
var config = require('../config/config.js');
var client = new cassandra.Client({contactPoints: [config.cassandraDB], keyspace: 'lastnyte'});

