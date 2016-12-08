
const Botkit = require('botkit');
const util = require('util');
// const db = require('./db');

var provider = require('./provider')

var sql = require('./sql').sessions;

// db.any("select * from sessions where id=$1", [1])
//     .then(function (data) {
//         console.log("Slack Usrer ID:", data[0].slack_id);
//     })
//     .catch(function (error) {
//         console.log("ERROR:", error);
//     })
//     .finally(db.end); // for immediate app exit, closing the connection pool.

// console.log(provider.findUser());
provider.addSession('xyz123', 'duyen');



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
