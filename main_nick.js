
const Botkit = require('botkit');
const util = require('util');
const db = require('./db');

// console.log(db.pgp.end())

// var db = require('./db');
// db.any("select * from tbSession")
//     .then(function (data) {
//         console.log("DATA:", data)
//     })
//     .catch(function (error) {
//         console.log("Error:", error);
//     })
//     .finally(function () { 
//         // pgp.end() 
//     });

// var promise = require('bluebird')
// var options = { promiseLib: promise }
// var pgp = require('pg-promise')(options)

// db = pgp('postgres://Nic@localhost:3000/slackbotDB')

// db.any("select * from tbSession").then(function (data){
//     console.log(data)
// });

//--testing region-----

// var promise = require('bluebird'); // or any other Promise/A+ compatible library;

// var options = {
//     promiseLib: promise // overriding the default (ES6 Promise);
// };

// var pgp = require('pg-promise')(options);
// var cn= 'postgres://postgres@localhost:5432/slackbotDB';
// var db = pgp(cn); // database instance;

// NOTE: The default ES6 Promise doesn't have method `.finally`, but it is
// available within Bluebird library used here as an example.

db.any("select * from sessions")
    .then(function (data) {
        console.log("DATA:", data);
    })
    .catch(function (error) {
        console.log("ERROR:", error);
    })
    .finally(db.end); // for immediate app exit, closing the connection pool.
//----end of testing region



const { setAdminID, getAdminID, setAdminName, getAdminName, setLunch, getLunch,
        setPrice, getPrice,
        //setGroup, getGroup,
        setConfirmed, getConfirmed,
        //setDeclined, getDeclined
        getMenu } = require('./slackchefbot_storage');

// TODO: add module for NLP - wit.au

// NOTE: during development storage time out occurs after two minutes
// TODO: integrate database
// TODO: test live in-memory storage


const token = process.env.SLACKBOT_TOKEN;

const controller = Botkit.slackbot({
    // reconnects to Slack RTM after failed connection
    retry: Infinity,
    debug: false
    // verbose logging
    // logLevel: 7
});


// connect the bot to a stream of messages
controller.spawn({token: token}).startRTM(function(err) {
  if (err) {
    throw new Error(err);
  }

});

controller.on('bot_channel_join', function (bot, message) {
    bot.reply(message, 'Let\'s lunch people.')
})

// admin sets lunch and price
controller.hears(['set lunch (.*) set price (.*)'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    setLunch(message.match[1]);
    setPrice(message.match[2]);

    console.log(message.match[1]); 
    console.log(message.match[2]);

    //

    bot.reply(message, `Today's menu is ${getLunch()} at $${getPrice()}.`);
    // TODO: add 'Please confirm? Y/N'

    bot.api.users.info({user: message.user}, (error, response) => {
        setAdminID(response.user.id);
        setAdminName(response.user.name);
        // console.log(getAdminID() + getAdminName());
        bot.reply(message, getAdminName() + ' is today\'s lunch administrator.');
    })
});

controller.hears(['hello'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    // TEST
    bot.reply(message,  getLunch());
    bot.reply(message, 'Hi.');
    bot.reply(message, `${getAdminName()} is the administrator for today's lunch`);

});

// on today's menu
controller.hears(['lunch', 'menu'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    // TODO: check if user has confirmed. If yes, only send menu
    bot.reply(message, `Today's menu is ${getLunch()} at $${getPrice()}. Are you in?`);

    //---- insert data to database --------


    debugger

});

// user confirms
controller.hears([/[i\'m] in/, 'yes', 'confirm'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    bot.reply(message, `${getLunch()} is on the way ;)`);

    bot.api.users.info({ user: message.user }, (error, response) => {
        // user = response.user.id;
        setConfirmed(response.user.name);
        // TODO: list to display name and real name
        bot.reply(message, 'CONFIRMED\n' + getConfirmed().join('\n'));
        //console.log('RESPONSE' + response);
        console.log(util.inspect(response, false, null));
    });

});

// user declines
controller.hears([/[i\'m] out/, 'no'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    // TODO remove user from group

    bot.reply(message, 'Perhaps you can join us tomorrow.');

});

// user checks for adminimistrator
controller.hears(['admin'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    bot.reply(message, `${getAdminName()} is the administrator for today's lunch.`);

});