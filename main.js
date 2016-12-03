const Botkit = require('botkit');
// TODO add module/s for list and database
// TODO add custom modules for NLP - wit.au




const token = process.env.SLACKBOT_TOKEN;

const controller = Botkit.slackbot({
  // reconnects to Slack RTM after failed connection
  retry: Infinity,
  debug: false,
  // verbose logging
  logLevel: 7
});

// connect the bot to a stream of messages
controller.spawn({token}).startRTM(function(err) {
  if (err) {
    throw new Error(err);
  }
});

// bot listens to...
controller.hears(['hello'],['direct_message','direct_mention','mention'],function(bot,message) {

  bot.reply(message,'Hi.');

});

// on today's menu
controller.hears(['lunch', 'menu'],['direct_message','direct_mention','mention'],function(bot,message) {

  bot.reply(message,'The menu for today is Mexican burritos.');

});

// user confirms
controller.hears(['yes', 'confirm'],['direct_message','direct_mention'],function(bot,message) {

  bot.reply(message,'Mexican burritos on the way ;)');
  // TODO add user to the list

});

// user declines
controller.hears(['no'],['direct_message','direct_mention'],function(bot,message) {

  bot.reply(message,'Perhaps you can join us tomorrow.');
  // TODO remove user from the list

});
