var db = require('./db');
var sql = require('./sql').sessions;


var  result = ''

module.exports = {
    // addSession: function (slackId, userName) {
    //     return db.none(sql.add, [slackId, userName]);
    // },
    addSession: function (user, text, channel, reply) {
        return db.none(sql.add, [user, text, channel, reply]);
    },

    // findUser: function (username) {
    //     console.log(sql.search)
    //     console.log(db.one(sql.search, {username}));
    //     // return db.any(sql.search, username);

    //     // return data = db.any("select * from sessions where username=$1", username)
    // }
    testVar: function (name) {
        return 'mallabo' + name
    },

    findUser: function (user_id) {

        return db.any(sql.search, user_id)
        //     .then(function (data) {
        //         console.log("My Slack User ID: = ", data[0].slack_id)
        //         result = data[0].slack_id
        //     })
        //     .catch(function (error) {
        //         console.log("ERROR:", error)
        //     })
        //     // .finally(db.end);
        // return result
    
    }
}; 