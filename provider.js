var db = require('./db');
var sql = require('./sql').sessions;

module.exports = {

    addSession: function (adminId) {
        return db.none(sql.add, adminId);
    },

    updateSession: function (lunch, price, adminId) {
        return db.none(sql.update, [lunch, price, adminId]);
    },
    

    findUser: function (user) {
        return db.any(sql.search, user)
    },

    deleteSession: function () {
        return db.none(sql.delete)
    }
}; 