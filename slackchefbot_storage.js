const LunchOrders = () => {
    let adminID = '';
    let adminName = '';
    let channelID = '';
    let lunch = '';
    let price = '';

    let confirmed = [];
    //let declined = [];

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

    const renderMenu = () => `1. Lunch item: ${getLunch()}\n 2. Price: $${getPrice()}`;

    const setConfirmed = (val) => confirmed.push(val);
    const getConfirmed = () => confirmed;

    //const setDeclined = (val) => declined = val;
    //const getDeclined = () => declined;

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
        renderMenu,
        setConfirmed,
        getConfirmed,
        //setDeclined,
        //getDeclined,
    }
};

module.exports = LunchOrders();
