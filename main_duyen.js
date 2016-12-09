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
        setConfirmed(getAdminID())
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
                convo.ask('Set the price:', function (response, convo) {
                    setPrice(parseFloat(response.text).toFixed(2));
                    convo.next();

                    // displays menu to admin
                    let menu  = printMenu("lunch price")
                    menu["text"] = "This is the menu that will be sent to the channel:"

                    bot.reply(message,
                      menu
                    );



                    convo.say(
                      `To make further changes: \n
                      \`change lunch\` to change the lunch item\n
                      \`change price\` to change the price of the lunch\n
                      \`send menu\` to send the menu to the channel`);
                });
            });

        });
    }, 1000);
});

// change options
controller.hears(['change lunch'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    if (message.user === getAdminID()) {
      // sets new lunch
      bot.startPrivateConversation(message, function (err, convo) {
        convo.ask('Enter the new lunch item:', function (response, convo) {
            setLunch(response.text);
            convo.next();

            // displays menu to admin
            let menu  = printMenu('lunch price')
            menu['text'] = 'Here\'s the amended menu:'

            bot.reply(message,
              menu
            )

            // lists admin options
            convo.say(
              `Type: \n
              \`send menu\` to send the menu to the channel\n
              \`change lunch\` to change the lunch item\n
              \`change price\` to change the price of the lunch`);

        });
      });
    } else {
      bot.reply(message, 'You do not have access to make these changes')
    }

});

controller.hears(['change price'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    if (message.user === getAdminID()) {
      // sets new price
      bot.startPrivateConversation(message, function (err, convo) {
        convo.ask('Enter the new price:', function (response, convo) {
            setPrice(response.text);
            convo.next();

            // displays menu to admin
            let menu  = printMenu('lunch price')
            menu['text'] = 'Here\'s the amended menu:'

            bot.reply(message,
              menu
            )

            // lists admin options
            convo.say(
              `Type: \n
              \`send menu\` to send the menu to the channel\n
              \`change lunch\` to change the lunch item\n
              \`change price\` to change the price of the lunch`);

        });
      });
    } else {
      bot.reply(message, 'You do not have access to make these changes')
    }

});

controller.hears(['send menu'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
    // console.log(message);

    if (message.user === getAdminID()) {

      var menu = printMenu("organiser lunch price");
      menu["channel"] = getChannelID();
      menu["attachments"][0]['fallback'] = `Organiser: ${getAdminName()} Dish: ${getLunch()} Price: ${getPrice()}`;
      menu["text"] = `*Lunch for Today*\n
      Type:\n
      \`i'm in\` to join us\n
      \`i'm in\` to decline or change your mind.`;

      // send menu to the channel
      bot.say(
          menu
      );

    } else {
      bot.reply(message, 'You do not have access')
    }
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
    menu = printMenu("organiser lunch price")
    bot.reply(message, menu);

});

// user confirms
controller.hears([/[i\'m] in/], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    if (getConfirmed().indexOf('<@' + message.user + '>') >= 0) {
      bot.reply(message, "You are already in");
      return;
    }

    if (getLunch() === '' || getPrice() === '' || getPrice() === NaN) {
      bot.reply(message, `The lunch order has not yet been set`);
      return;
    }

    bot.api.users.info({ user: message.user }, (error, response) => {
        setConfirmed(response.user.id);

        bot.reply(message, 'Thanks for confirming '+ response.user.name);
    });

});

// user declines
controller.hears([/[i\'m] out/], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    bot.api.users.info({ user: message.user }, (error, response) => {
        removedConfirmed(response.user.id);

        bot.reply(message, 'Sorry you declined '+ response.user.name);
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
          As the administrator, your commands are:\n
          \`menu\` to see today's menu\n
          \`change lunch\` to change the lunch item\n
          \`change price\` to change the price\n
          \`send menu\` to send the menu to the channel\n
          \`list in\` to see confirmed lunchers\n
          Type \`help\` any time to see this list again.`
        );
      } else {
        bot.reply(
          message,
          `Hi <@${message.user}>!\n
          Your commands are:\n
          \`menu\` to see today's menu
          \`i'm in\` to opt in for lunch
          \`i'm out\` to opt out of lunch
          \`list in\` to see all confirmed lunchers
          Type \`help\` any time to see this list again.`
        );
      }
     })
});

// gets the confirmed list - available to ADMIN & USERS
controller.hears(['list in'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {

    bot.reply(message, printMenu("people"));

});

// ADMIN ONLY

// administrator clears session
controller.hears(['end session'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  bot.reply(message, printMenu("organiser lunch price people total"));
  resetLunch();

});
