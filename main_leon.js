const Botkit = require('botkit');
const util = require('util')
const { setAdminID, getAdminID, setAdminName, getAdminName, setLunch, getLunch,
        setPrice, getPrice,
        //setGroup, getGroup,
        setConfirmed, getConfirmed,
        //setDeclined, getDeclined,
        getMenu } = require('./slackchefbot_storage');

// TODO: add module for NLP - wit.au

// NOTE: during development storage time out occurs after two minutes
// TODO: integrate database
// TODO: test live in-memory storage


const token = process.env.SLACK_TOKEN;

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

    // var menu = {
    //   "attachments": [ {
    //
    //         "title" : getLunch(),
    //         "title_link" : `https://www.google.com.au/#q=${getLunch()}`
    //
    //   }]
    // }


    bot.reply(message, menu());
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


    bot.reply(message, menu("total lunch price"));

});

function menu(options) {
  var o = options.split(" ");

  var menu = {
    "attachments" : [ {
        "fields" : processOptions(options)

      }
    ]

  }
  function processOptions(options) {
  return options.split(" ").map(
      (o) => { switch( o ) {
        case "lunch" : return {
            "title" : "Dish",
            "value" : getLunch(),
            "short" : true
          };
          break;
        case "price" : return {
            "title" : "Price",
            "value" : `$${getPrice()}`,
            "short" : true
          };
          break;
        case "organiser" : return {
            "title" : "Organiser",
            "value" : getAdminName(),
            "short" : true
          };
          break;
        case "total" : return {
            "title" : "Total Price so far",
            "value" : `$${getPrice()*(getConfirmed().length+1)}`,
            "short" : true
          };
          break;
        case "people" : return {
            "title" : "People who are in",
            "value" : getConfirmed().join(", "),
            "short" : true
          };
          break;
        default : break;
    } } )
  }



  // if (o.includes("lunch")) {
  //   menu["attachments"][0]["fields"].push({
  //       "title" : "Dish",
  //       "value" : getLunch(),
  //       "short" : true
  //     });
  // }
  // if (o.includes("price")) {
  //     menu["attachments"][0]["fields"].push({
  //       "title" : "Price",
  //       "value" : `$${getPrice()}`,
  //       "short" : true
  //     });
  // }
  // if (o.includes("organiser")) {
  //   menu["attachments"][0]["fields"].push({
  //       "title" : "Organiser",
  //       "value" : getAdminName(),
  //       "short" : true
  //     });
  // }
  // if (o.includes("total")) {
  //   menu["attachments"][0]["fields"].push({
  //       "title" : "Total Price so far",
  //       "value" : `$${getPrice()*(getConfirmed().length+1)}`,
  //       "short" : true
  //   });
  // }
  // if (o.includes("people")) {
  //   menu["attachments"][0]["fields"].push({
  //       "title" : "People who are in",
  //       "value" : getConfirmed().join(", "),
  //       "short" : false
  //   });
  // }

  return menu

}

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
