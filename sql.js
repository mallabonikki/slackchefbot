var QueryFile = require('pg-promise').QueryFile;
var path = require('path')

// var cn = { 
//     host: 'localhost',
//     port: 3000,
//     database: 'slackbotDB',
//     user: 'Nick',
//     password: '1'
// }

// var db  = QueryFile(cn);

function sql(file) {
    var fullPath = path.join(__dirname, file);
    return new QueryFile(fullPath, {minify: true});
}

module.exports = {
    users: {
        add: sql('users.create.sql')
        // search: sql('users.search.sql')
    }
}
