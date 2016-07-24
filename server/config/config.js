module.exports = {
    log: {
        console: {
            enabled: true,
            level: 'debug',
            colorize: false
        },
        plaintext: {
            enabled: false,
            level: 'debug',
            filename: 'app.log',
            dirname: 'logs',
            maxsize: 10485760
        },
        audit: {
            enabled: true,
            level: 'audit',
            filename: 'appAudit.log',
            dirname: 'logs',
            maxsize: 10485760
        }
    },
    serviceUrl : "http://localhost:3000/rest/",
    cassandraDB: "localhost",
    cassandraKeySpace: "ideaclub",
    cassandraUser: "cassandra",
    cassandraPassword: "cassandra",
    smptAuth: {
        user: "neppoliyant@gmail.com",
        pass: "fire@2828"
    },
    accountSid: "AC165b909e217a42e885300a568e261f04",
    authToken: "de7e707fb059fb3417e28394d5a41bd7",
    sendingNumber: "+18565796361"
}