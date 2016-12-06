const Botkit = require('botkit');
// TODO add module/s for list and database
// TODO add custom modules for NLP - wit.au


const token = process.env.SLACK_TOKEN;


const controller = Botkit.slackbot({
  // reconnects to Slack RTM after failed connection
  retry: Infinity,
  debug: false,
  // verbose logging
  // logLevel: 7
});

// connect the bot to a stream of messages
controller.spawn({token: token}).startRTM(function(err) {
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

  var images = ["https://static01.nyt.com/images/2015/12/09/dining/09COOKING-BEEFROAST3/09COOKING-BEEFROAST3-superJumbo.jpg", "https://www.usfoods.com/content/www/home/food/scoop/scoop-favorites/beef-pork-poultry/fully-cooked-pork-belly/_jcr_content/mainpar/image_0.img.jpg/1374862380437.jpg", "http://finedininglovers.cdn.crosscast-system.com/BlogPost/l_2737_11010041.jpg", "http://www.seriouseats.com/images/20100716-sushi-nigiri-01.jpg"]

  const menu = ["beef", "pork", "vege", "seafood"].map( (food, index) => { return {
      dish : food,
      price : parseInt(Math.random()*6),
      image_url : images[index]
    }
  });


  var menuDisplay = menu.map( food => {
    return {
      "text": food.dish + ": $" + food.price,
      "image_url": ""
    };
  })


  var attachment = {
    "attachments": [{"title": "Today's menu"}].concat(menuDisplay)
  }



  bot.reply(message, attachment);

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
