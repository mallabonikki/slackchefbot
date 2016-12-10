var QueryFile = require('pg-promise').QueryFile;
var path = require('path');

function sql(file) {
    var fullPath = path.join(__dirname, file); // generating full path;
    return new QueryFile(fullPath, {minify: true});
}

module.exports = {
    sessions: {
        add: sql('./sql/sessions/create.sql'),
        search: sql('./sql/sessions/search.sql'),
        update: sql('./sql/sessions/update.sql'),
        delete: sql('./sql/sessions/delete.sql')
    }
};

