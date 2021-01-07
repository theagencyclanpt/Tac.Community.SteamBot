const axios = require('axios');
const STEAM_USER = require("steam-user");

function ValidateMessageAndExecuteCallback(message, callback) {
    if(message){
        if(callback && typeof callback === 'function'){
            callback(message)
        }
    }
}

async function GetSenderNickName(steamDevKey, steamIdBase64){
    return await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamDevKey}&steamids=${steamIdBase64}`);
}

module.exports = ({ accountName, password, steamDevKey }) => {
  let client = new STEAM_USER();
  client.logOn({
    accountName: accountName,
    password: password,
  });

  return {
    STEAM_USER,
    STEAM_API_KEY: steamDevKey,
    STEAM_CLIENT: client,
    CHAT_GROUP_ID: null,
    CHAT_ID: null,
    STEAM_ID_SENDER: null,
    STEAM_ID_SENDER_BASE64: null,
    SetCustomState: function({game, state}) {
        this.STEAM_CLIENT.on('loggedOn', () => {
          this.STEAM_CLIENT.setPersona(state);
          this.STEAM_CLIENT.gamesPlayed(game);
        });
    },
    Mention: async function () {
        try {
            var result = (await GetSenderNickName(this.STEAM_API_KEY, this.STEAM_ID_SENDER_BASE64)).data;
        } catch (error) {
            console.error("Error on get player name.");
        }
      return `[mention=${this.STEAM_ID_SENDER.accountid}]@${result.response.players[0].personaname}[/mention]`;  
    },
    Answer: function(message){
        this.STEAM_CLIENT.chat.sendChatMessage(
            this.CHAT_GROUP_ID,
            this.CHAT_ID,
            message 
        );
        return this;
    },
    ChatGroupManagement: function(callback)  {
      this.STEAM_CLIENT.chat.on("chatMessage", ({ chat_group_id, chat_id, steamid_sender, message }) => {
          this.CHAT_GROUP_ID = chat_group_id;
          this.CHAT_ID = chat_id; 
          this.STEAM_ID_SENDER = steamid_sender;
          this.STEAM_ID_SENDER_BASE64 = steamid_sender.getSteamID64();

          console.log(steamid_sender, this.STEAM_ID_SENDER_BASE64);
          ValidateMessageAndExecuteCallback(message, callback);
        }
      );
      return this;
    },
  };
};
