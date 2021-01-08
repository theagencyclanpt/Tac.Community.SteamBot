const axios = require('axios');
const STEAM_USER = require("steam-user");

async function GetSenderNickName(steamDevKey, steamIdBase64){
    return await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamDevKey}&steamids=${steamIdBase64}`);
}

function GetLastMessageData(userBase64, server_timestamp, selectEvent, timeout) {
  let time = new Date(server_timestamp);
  time.setSeconds(time.getSeconds() + timeout);

  return {
    Time: time,
    Command: selectEvent.commandName,
    UserIdBase64: userBase64
  };
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
    CHAT_COMMANDS: [],
    TIME_OUT: 2,
    LAST_MESSAGE: {Command: null, Time: 0, UserIdBase64: 0},
    SetTimeOut: function(timeOut){
      this.TIME_OUT = timeOut;
      return this;
    },
    AddCommand: function ({commandName, commandDescription, commandCallback, commandTimeOut}) {
      if(!commandCallback || !(typeof commandCallback === 'function')){
        console.error(`Invalid callback on command: ${commandName}`)
      }
      this.CHAT_COMMANDS.push({commandName, commandDescription, commandCallback, commandTimeOut});
      return this;
    },
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
    ChatGroupManagement: function()  {
      this.STEAM_CLIENT.chat.on("chatMessage", ({ chat_group_id, chat_id, steamid_sender, message, server_timestamp }) => {
          this.CHAT_GROUP_ID = chat_group_id;
          this.CHAT_ID = chat_id; 
          this.STEAM_ID_SENDER = steamid_sender;
          this.STEAM_ID_SENDER_BASE64 = steamid_sender.getSteamID64();

          let selectEvent = this.CHAT_COMMANDS.find(function(command) {
            if(command.commandName === message){ 
              return true;
            }
          });

          if(selectEvent){
            let timeOutCalculated = (selectEvent.commandTimeOut ? selectEvent.commandTimeOut : this.TIME_OUT) * 1000;
            let tempDate = new Date(server_timestamp);

            if(this.STEAM_ID_SENDER_BASE64 == this.LAST_MESSAGE.UserIdBase64 && 
              this.LAST_MESSAGE.Command == selectEvent.commandName && tempDate < this.LAST_MESSAGE.Time){
              console.log("Same Command.");
              return this;
            }

            setTimeout(() => {
              selectEvent.commandCallback(message);
            }, timeOutCalculated);

            this.LAST_MESSAGE = GetLastMessageData(this.STEAM_ID_SENDER_BASE64, server_timestamp, selectEvent.commandName, timeOutCalculated / 1000);
          }
        }
      );
      return this;
    },
  };
};
