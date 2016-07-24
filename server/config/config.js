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
    }
}