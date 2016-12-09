const Storage = () => {
    let adminID = '';
    let adminName = '';
    let channelID = '';
    let lunch = '';
    let price = '';

    let confirmed = [];
    let declined = [];

    const setAdminID = (val) => adminID = val;
    const getAdminID = () => adminID;

    const setAdminName = (val) => adminName = val;
    const getAdminName = () => adminName;

    const setChannelID = (val) => channelID = val;
    const getChannelID = () => channelID;

    const setLunch = (val) => lunch = val;
    const getLunch = () => lunch;

    const setPrice = (val) => price = val;
    const getPrice = () => price;

    const setImageUrl = (val) => price = val;
    const getImageUrl = () => price;

    const printMenu = (options) => {
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
                  "value" : `<@${getAdminID()}>`,
                  "short" : false
                };
                break;
              case "total" : return {
                  "title" : "Total Price so far",
                  "value" : `$${getPrice() * (getConfirmed().length + 1)}`,
                  "short" : false
                };
                break;
              case "people" : return {
                  "title" : "People who are in",
                  "value" : getConfirmed().join(", "),
                  "short" : false
                };
                break;
              default : break;
          }
        } )
      }
      return menu
    }

    const setConfirmed = (val) => confirmed.push('<@' + val + '>');

    const getConfirmed = () => confirmed;

    const removedConfirmed = (val) => {

      console.log(confirmed)

      confirmed = confirmed.filter( (v) => {
        return v !== '<@' + val + '>'
      } )
    }

    const resetLunch = () => {
      adminID = '';
      adminName = '';
      channelID = '';
      lunch = '';
      price = '';

      confirmed = [];
    }

    return {
        setAdminID,
        getAdminID,
        setAdminName,
        getAdminName,
        setChannelID,
        getChannelID,
        setLunch,
        getLunch,
        setPrice,
        getPrice,
        setImageUrl,
        getImageUrl,
        printMenu,
        setConfirmed,
        getConfirmed,
        removedConfirmed,
        resetLunch
    }
};

module.exports = Storage();
