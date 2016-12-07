const Botkit = require('botkit');
const util = require('util')

const LunchOrders = require('./slackchefbot_storage');
const setAdminID = LunchOrders.setAdminID;
const getAdminID = LunchOrders.getAdminID;
const setAdminName = LunchOrders.setAdminName;
const getAdminName = LunchOrders.getAdminName;
const setChannelID = LunchOrders.setChannelID;
const getChannelID = LunchOrders.getChannelID;
const setLunch = LunchOrders.setLunch;
const getLunch = LunchOrders.getLunch;
const setPrice = LunchOrders.setPrice;
const getPrice = LunchOrders.getPrice;
const renderMenu = LunchOrders.renderMenu;
const setConfirmed = LunchOrders.setConfirmed;
const getConfirmed = LunchOrders.getConfirmed;
const setDeclined = LunchOrders.setDeclined;
const getDeclined = LunchOrders.getDeclined;

// TODO: add module for NLP - wit.au
// TODO: integrate database


const token = process.env.SLACK_TOKEN;

const controller = Botkit.slackbot({
    // reconnects to Slack RTM after failed connection
    retry: Infinity,
    debug: false,
    // verbose logging
    logLevel: 4
});

controller.spawn({ token: token }).startRTM(function (err) {
    if (err) {
        throw new Error(err);
    }
});

controller.on('bot_channel_join', function (bot, message) {
    bot.reply(message, 'Let\'s lunch people.')
})

// initiates administator access
controller.hears(['i am the administrator'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    // TODO: check for existing administrator and block other users from overriding

    // send administrator details to storage
    bot.api.users.info({ user: message.user }, (error, response) => {
        setAdminID(response.user.id);
        setAdminName(response.user.name);
        setChannelID(message.channel);
        bot.reply(message, getAdminName() + ' is currently setting up today\'s lunch.');
    });

    setTimeout(function () {
        // bot starts conversation to prompt for details
        bot.startPrivateConversation(message, function (err, convo) {

            // set lunch
            convo.ask('What\'s today\'s lunch item?', function (response, convo) {
                setLunch(response.text);
                convo.next();

                // set price
                convo.ask('Set the price.', function (response, convo) {
                    setPrice(response.text);
                    convo.next();

                    convo.say(renderMenu());

                    convo.ask('Please enter yes to confirm or the number to change.', [
                    // TODO: loop for confirmation
                    //{
                    //    pattern: '1',
                    //    callback: function (response, convo) {
                    //        convo.ask('Enter today\'s lunch item.', function (response, convo) {
                    //            setLunch(response.text);
                    //            convo.next();
                    //            convo.say(renderMenu());
                    //        })
                    //        //convo.say('testing');
                    //    }
                    //},
                    //{
                    //    pattern: '2',
                    //    callback: function (response, convo) {
                    //        convo.say('Bye!');
                    //
                    //    }
                    //},
                    {
                        pattern: 'yes',
                        callback: function (response, convo) {
                            convo.say('Type `send` to send the menu to channel.');
                            convo.next();
                        }
                    },
                    {
                        default: true,
                        callback: function (response, convo) {
                            convo.repeat();
                        }
                    }
                    ])
                });
            });

            // TODO: incorporate card details - LEON

        });
    }, 1000);
});

controller.hears(['send'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    // console.log(message);

    // TODO: validate admin

    // send menu to the channel
    bot.say(
        {
            text: `${getAdminName()} has organised today's lunch:\n` + renderMenu() + `\ntest channel message!`,
            channel: getChannelID()
        }
    );
});


// ALL USERS

controller.hears(['hello'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    // TODO: bot says helo and prints commands.
    // if there is an administrator, send details
    // TEST
    bot.reply(message,  getLunch());
    bot.reply(message, 'Hi.');
    bot.reply(message, `${getAdminName()} is the administrator for today's lunch`);

});

// on today's menu
controller.hears(['lunch', 'menu'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    // TODO: check if user has confirmed. If yes, only send menu
    bot.reply(message, `Today's menu is ${getLunch()} at $${getPrice()}. Are you in?`);

});

// user confirms
controller.hears([/[i\'m] in/], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    bot.api.users.info({ user: message.user }, (error, response) => {

        // TODO: validation for confirmed
        setConfirmed(response.user.id);

        // TODO: list to display name and real name
        bot.reply(message, 'Thanks for confirming '+ response.user.name);
        //console.log('RESPONSE' + response);
        // console.log(util.inspect(response, false, null));
    });

});

// user declines
// controller.hears([/[i\'m] out/], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
//
//     bot.api.users.info({ user: message.user }, (error, response) => {
//
//         // TODO: validation for delined
//         setDeclined(response.user.name);
//
//         // TODO: list to display name and real name
//         bot.reply(message, 'Sorry you declined '+ response.user.name);
//         //console.log('RESPONSE' + response);
//         // console.log(util.inspect(response, false, null));
//     });
//
// });

// user locates the administrator
// controller.hears(['admin'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
//
//     bot.reply(message, `${getAdminName()} is the administrator for today's lunch.`);
//
// });


// // ADMIN ONLY

// admin gets confirmed list
// controller.hears(['list in'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
//
//     // TODO: validate admin
//     // response.user.name
//
//     // TODO: list to display name and real name
//     bot.reply(message, `CONFIRMED\n ${getConfirmed().join('\n')}`);
//     //console.log('RESPONSE' + response);
//     // console.log(util.inspect(response, false, null));
//
// });
//
// // admin gets declined list
// controller.hears(['list out'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
//
//   // TODO: validate admin
//   // response.user.name
//
//     // TODO: list to display name and real name
//     bot.reply(message, `DECLINED\n ${getDeclined().join('\n')}`);
//     //console.log('RESPONSE' + response);
//     // console.log(util.inspect(response, false, null));
//
// });
//
//
// // TODO: administrator clears session
