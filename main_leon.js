const Botkit = require('botkit');
const util = require('util')

const Storage = require('./slackchefbot_storage');
const setAdminID = Storage.setAdminID;
const getAdminID = Storage.getAdminID;
const setAdminName = Storage.setAdminName;
const getAdminName = Storage.getAdminName;
const setChannelID = Storage.setChannelID;
const getChannelID = Storage.getChannelID;
const setLunch = Storage.setLunch;
const getLunch = Storage.getLunch;
const setPrice = Storage.setPrice;
const getPrice = Storage.getPrice;
const setImageUrl = Storage.setImageUrl;
const getImageUrl = Storage.getImageUrl;
const printMenu = Storage.printMenu;
const setConfirmed = Storage.setConfirmed;
const getConfirmed = Storage.getConfirmed;
const removedConfirmed = Storage.removedConfirmed;
const resetLunch = Storage.resetLunch;


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
controller.hears(['set admin'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    // TODO: check for existing administrator and block other users from overriding
    if (getAdminName() !== '' || getAdminID() !== '') {
      bot.reply(message, "You can't make a new lunch order while someone else is.");
      return;
    }


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


                    let menu  = printMenu("lunch price")
                    menu["text"] = "This is the menu that will be sent to the channel:"

                    bot.reply(message,
                      menu
                    );



                    convo.say(
                      `To make further changes: \n
                      \`change lunch\` to change the lunch item\n
                      \`change price\` to change the price of the lunch\n
                      \`send menu\` - send the menu to the channel`)
                });
            });

        });
    }, 1000);
});

controller.hears(['send menu'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    // console.log(message);

    // TODO: validate admin
    var menu = printMenu("organiser lunch price");
    menu["channel"] = getChannelID();
    menu["attachments"][0]['fallback'] = `Organiser: ${getAdminName()} Dish: ${getLunch()} Price: ${getPrice()}`;

    // send menu to the channel
    bot.say(
        menu
    );
});


// ALL USERS

controller.hears(['hello'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    // TODO: bot says helo and prints commands.
    // if there is an administrator, send details
    bot.reply(message,
      `Hi there. <@slackchefbot_duyen> is a lunch service.
      You can opt in or opt out of group lunches.
      Type \`help\` any time to see what's possible.`
    );

});

// on today's menu
controller.hears(['lunch', 'menu'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    // TODO: check if user has confirmed. If yes, only send menu
    bot.reply(message, `Today's menu is ${getLunch()} at $${getPrice()}. Are you in?`);

});

// user confirms
controller.hears([/[i\'m] in/], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    if (getConfirmed().indexOf('<@' + message.user + '>') >= 0) {
      bot.reply(message, "You are already in");
      return;
    }

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
controller.hears([/[i\'m] out/], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    bot.api.users.info({ user: message.user }, (error, response) => {

        // TODO: validation for delined
        removedConfirmed(response.user.id);

        // TODO: list to display name and real name
        bot.reply(message, 'Sorry you declined '+ response.user.name);
        //console.log('RESPONSE' + response);
        // console.log(util.inspect(response, false, null));
    });

});

// user locates the administrator
controller.hears(['admin'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    bot.reply(message, `${getAdminName()} is the administrator for today's lunch.`);

});

// help session
controller.hears(['help'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    // TODO: validate if admin, show admin menu

    bot.api.users.info({user: message.user}, (error, response) => {
      if (response.user.id === getAdminID()) {
        bot.reply(
          message,
          `Hi <@${message.user}>, thanks for organising today's lunch!\n
          You're commands are':\n
          \`menu\` - see today's menu\n
          \`change lunch\` - change the lunch item\n
          \`change price\`\n
          \`change image url\`\n
          \`send menu\` - send the menu to the channel\n
          \`list in\` - see all confirmed lunchers\n
          \`list out\` - see all declined lunchers\n
          Type \`help\` any time to see this list again.`
        );
      } else {
        bot.reply(
          message,
          `Hi <@${message.user}>! You can:
            \`menu\` - see today's menu
            \`i'm in\` - opt in for lunch
            \`i'm out\` - opt out for lunch
            \`list in\` - see all confirmed lunchers
            \`list out\` - see all declined lunchers
            Type \`help\` any time to see this list again.`
        );
      }
     })
});

// ADMIN ONLY

// admin gets confirmed list
controller.hears(['list in'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    // TODO: validate admin
    // response.user.name

    // TODO: list to display name and real name
    bot.reply(message, `CONFIRMED\n ${getConfirmed().join('\n')}`);
    //console.log('RESPONSE' + response);
    // console.log(util.inspect(response, false, null));

});

// TODO: administrator clears session
controller.hears(['end session'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  bot.reply(message, printMenu("organiser lunch price people total"));
  resetLunch();

}
