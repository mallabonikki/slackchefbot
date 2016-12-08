var db = require('./db');
var sql = require('./sql').sessions;

module.exports = {
    // addSession: function (slackId, userName) {
    //     return db.none(sql.add, [slackId, userName]);
    // },
    addSession: function (slackId, userName) {
        return db.any(sql.add, [slackId, userName]);
    },

    // findUser: function (username) {
    //     // return db.any(sql.search, username);
    //     return data = db.any("select * from sessions where username=$1", username)
    // }
    findUser: function (username) {
        db.any("select * from sessions where username=$1", username)
        .then(function (data) {
            console.log("My Slack User ID: = ", data[0].slack_id);
            // return data[0].slack_id
        })
        .catch(function (error) {
            console.log("ERROR:", error);
        })
        .finally(db.end)
    }
};