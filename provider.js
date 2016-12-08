var db = require('./db');
var sql = require('./sql').sessions;

module.exports = {
    // addSession: function (slackId, userName) {
    //     return db.none(sql.add, [slackId, userName]);
    // },
    addSession: function (slackId, userName) {
        return db.none(sql.add, [slackId, userName]);
    },

    findUser: function () {
        return db.any(sql.search)
    }
};