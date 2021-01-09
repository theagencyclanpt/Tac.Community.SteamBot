const STEAM_USER = require("steam-user");

module.exports = {
    SteamApiClient: null,
    SteamClient: null,
    Setup: function ({steamApiClient, accountName, accountPassword}) {
        this.SteamApiClient = steamApiClient;   
        this.SteamClient = new STEAM_USER();

        this.SteamClient.logOn({
            accountName: accountName,
            password: accountPassword,
          });
    },
    OnLogOn: function () {
        let steamClient = this.SteamClient;
        this.SteamClient.on("loggedOn", function () {
            steamClient.chat.getGroups((e, w) => console.log(e,w.chat_room_groups['17053990'], steamClient.groups));
        });
    }
}