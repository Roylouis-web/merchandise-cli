// starts the app using the MerchandiseCli class

const MerchandiseCli = require('./MerchandiseCli');

((async () => {
    try {
        await MerchandiseCli.displayLogo();
        await MerchandiseCli.authenticate();
    } catch (error) {
        console.log(error)
        await MerchandiseCli.logOutMessage();
        await MerchandiseCli.logOut();
    }
})());