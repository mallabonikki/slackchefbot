const LunchOrders = () => {
    let adminID = '';
    let adminName = '';
    let lunch = '';
    let price = '';
    let menu = `Today's menu is ${lunch} at $${price}.`;

    //let group = [];
    let confirmed = [];
    //let declined = [];

    const setAdminID = (val) => adminID = val;
    const getAdminID = () => adminID;

    const setAdminName = (val) => adminName = val;
    const getAdminName = () => adminName;

    const setLunch = (val) => lunch = val;
    const getLunch = () => lunch;

    const setPrice = (val) => price = val;
    const getPrice = () => price;

    //const setGroup = (val) => group = val;
    //const getGroup = () => group;

    const setConfirmed = (val) => confirmed.push(val);
    const getConfirmed = () => confirmed;

    //const setDeclined = (val) => declined = val;
    //const getDeclined = () => declined;

    // const getMenu = () => menu;

    return {
        setAdminID,
        getAdminID,
        setAdminName,
        getAdminName,
        setLunch,
        getLunch,
        setPrice,
        getPrice,
        //setGroup,
        //getGroup,
        setConfirmed,
        getConfirmed,
        //setDeclined,
        //getDeclined,
        // getMenu
    }
};

module.exports = LunchOrders();



// TODO: bot to send order reminder to remaining group