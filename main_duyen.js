const Botkit = require('botkit');
const util = require('util')
const { setAdminID, getAdminID, setAdminName, getAdminName, setLunch, getLunch,
        setPrice, getPrice,
        //setGroup, getGroup,
        setConfirmed, getConfirmed,
        //setDeclined, getDeclined,
        getMenu } = require('./slackchefbot_storage');
// TODO: add module for NLP - wit.au


const token = process.env.SLACKBOT_TOKEN;

const controller = Botkit.slackbot({
    // reconnects to Slack RTM after failed connection
    retry: Infinity,
    debug: false,
    // verbose logging
    logLevel: 7
});

controller.spawn({ token: token }).startRTM(function (err) {
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
    // console.log('LUNCH: ' + getLunch())
    // console.log('PRICE: ' + price)
    // console.log(message.user)
    // bot.reply(message, menu + getLunch());
    bot.reply(message, `Today's menu is ${getLunch()} at $${getPrice()}.`);
    // TODO: add 'Please confirm? Y/N'

    bot.api.users.info({user: message.user}, (error, response) => {
        setAdminID(response.user.id);
        setAdminName(response.user.name);
        // console.log(getAdminID() + getAdminName());
        bot.reply(message, getAdminName() + ' is today\'s lunch administrator.');
    })

    // TODO: investigate channel_not_found	error: not_authed
    // how to get channel id back from users methods
    // for now - team members need to register to be added
    // bot.api.channels.info({ channel: 'D39TVBP4H' }, (error, response) => {
    //    console.log(util.inspect(response, false, null));
    //    //bot.reply(message, response.channel.members);
    // })

    /* channel_not_found	error: not_authed
    team members need to be manually entered into the array */
});

controller.hears(['hello'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    bot.reply(message, 'Hi.');

});

// on today's menu
controller.hears(['lunch', 'menu'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    // TODO: not returning
    bot.reply(message, `Today's menu is ${getLunch()} at $${getPrice()}. Are you in?`);

});

// user confirms
controller.hears([/[i\'m] in/, 'yes', 'confirm'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    // TODO: not returning
    bot.reply(message, `${getLunch()} is on the way ;)`);

    // TODO add user to confirmed not working: returns '1'
    bot.api.users.info({ user: message.user }, (error, response) => {
        user = response.user.id;
        // pass getConfirmed array into setConfirmed and push new value
        setConfirmed(getConfirmed().push('testing123'));
        bot.reply(message, 'CONFIRMED ' + getConfirmed());
        //console.log('RESPONSE' + response);
        console.log(util.inspect(response, false, null));
    });

});

// user declines
controller.hears([/[i\'m] out/, 'no'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    // TODO remove user from group

    bot.reply(message, 'Perhaps you can join us tomorrow.');


});

// team members have to register for the service - channel.info not working
controller.hears(['register me'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    bot.api.users.info({ user: message.user }, (error, response) => {

        // console.log(util.inspect(response, false, null));
        // add user to group

        bot.reply(message, `You're registered  for slackchef lunches ${response.user.name}. Happy eating!`);
    });
});
