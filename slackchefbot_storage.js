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

    // TODO: Leon to refactor this function
    const renderMenu = () => `1. Lunch item: ${getLunch()}\n 2. Price: $${getPrice()}`;

    const setConfirmed = (val) => confirmed.push('<@' + val + '>');
    // TODO: setConfirmed
    // if user is in the confirmed array, do nothing
    // if user is in declined array, delete user from declined array
    // push value to the confirmed array

    const getConfirmed = () => confirmed;

    const setDeclined = (val) => declined.push('<@' + val + '>');
    // TODO: setDeclined
    // if user is in the declined array, do nothing
    // if user is in declined array, delete user from declined array
    // push value to the declined array

    const getDeclined = () => declined;

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
        renderMenu,
        setConfirmed,
        getConfirmed,
        setDeclined,
        getDeclined,
    }
};

module.exports = Storage();
