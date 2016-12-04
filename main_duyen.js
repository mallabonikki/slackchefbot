// const botkitStoragePostgres = require('botkit-storage-postgres');
const Botkit = require('botkit');
const { getState, setState, isInQueue, getUserIndex, makeNiceList } = require('./slackchefbot_storage.js');
// TODO: add module for NLP - wit.au


// TODO: rewrite into storage module
var admin = '';
var lunch = '';
var price = 0;
var menu = `Today's menu is ${lunch} at $${price}.`;

// bot to send order reminder to remaining group
var group = [];
var confirmed = [];


const token = process.env.SLACKBOT_TOKEN;

const controller = Botkit.slackbot({
  storage: my_storage_provider
  // storage: botkitStoragePostgres({
  //   host: 'localhost',
  //   user: 'botkit',
  //   password: 'botkit',
  //   database: 'botkit'
  // }),
  // reconnects to Slack RTM after failed connection
  retry: Infinity,
  debug: false,
  // verbose logging
  logLevel: 7
});

// connect the bot to a stream of messages
controller.spawn({token: token}).startRTM(function(err) {
  if (err) {
    throw new Error(err);
  }
});

// admin sets lunch and price
controller.hears(['set lunch (.*) set price (.*)'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
  // TODO: store values
  lunch = message.match[1];
  price = message.match[2];
  // controller.storage.users.save({id: message.user, foo:'bar'}, function(err) { ... });

  // bot.reply(message, 'LUNCH: ' + lunch + menu)
  // bot.reply(message, 'PRICE: ' + price + menu)
  bot.reply(message, menu)

  // TODO: store admin
  // get user id and store admin in storage
  bot.api.users.info({user: message.user}, (error, response) => {
    admin = response.user.id;
    console.log('ADMIN: ' + admin)


  });

  // validate if they enter lunch and price at the same time

  // get group details - all user_ids in channel, store in group - cannot be immutable.

});

controller.hears(['hello'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {

  bot.reply(message,'Hi.');

});

// on today's menu
controller.hears(['lunch', 'menu'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {

  bot.reply(message, menu);
  console.log('MESSAGE USER ' + message.user);
  console.log('MESSAGE TEXT ' + message.text);
  console.log('MESSAGE TS ' + message.ts);

});

// user confirms
controller.hears([/[i\'m] in/, 'yes', 'confirm'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {

  bot.reply(message,'Mexican burritos on the way ;)');

  // TODO add user to confirmed
  // gets user id
  bot.api.users.info({user: message.user}, (error, response) => {
    user = response.user.id;

  });

});

// user declines
controller.hears([/[i\'m] out/, 'no'], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {

  bot.reply(message,'Perhaps you can join us tomorrow.');
  // TODO remove user from group

});
