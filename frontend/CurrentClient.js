class CurrentClient {
    constructor(client, token) {
        this.client = client;
        this.token = token;
    }
}

const currentClient = new CurrentClient();

module.exports = currentClient;