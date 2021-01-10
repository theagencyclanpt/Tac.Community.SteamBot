const AXIOS = require('axios');
const STEAM_USER = require("steam-user");
const fs = require('fs');

// Simples função para retornar os dados de determinado ficheiro;
function processLineByLine($filePath) {

  var MessageToSend = "/pre ";

  try {
      const data = fs.readFileSync($filePath, 'utf8')

      MessageToSend += data;
      //console.log(data)
  } catch (err) {
      console.error(err)
  }

  return MessageToSend;
  
}

async function GetSenderNickName(steamDevKey, steamIdBase64){
  return await AXIOS.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamDevKey}&steamids=${steamIdBase64}`);
}

async function GetMembersNames(steamDevKey, base64IdMembers) {
  let lastBase64 = base64IdMembers[base64IdMembers.length - 1];
  let base64IdsString = '';
  base64IdMembers.forEach(base64IdMember => {
    base64IdsString = base64IdsString + base64IdMember;
    
    if(base64IdMember == lastBase64){
      return;
    }

    base64IdsString = base64IdsString + ",";
  });

  return await AXIOS.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamDevKey}&steamids=${base64IdsString}`);
} 

function GetLastMessageData(userBase64, server_timestamp, commandName, timeout) {
  let time = new Date(server_timestamp);
  time.setSeconds(time.getSeconds() + timeout);

  return {
    Time: time,
    Command: commandName,
    UserIdBase64: userBase64
  };
}

module.exports = ({ accountName, password, steamDevKey, botAccountId }) => {
  let client = new STEAM_USER();
  client.logOn({
    accountName: accountName,
    password: password,
  });

  client.on('error', function (err) {
    console.log(err);
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
    ALL_MEMBERS: [],
    BOT_ACCOUNT_ID: botAccountId,
    SetTimeOut: function(timeOut){
      this.TIME_OUT = timeOut;
      return this;
    },
    Init:function () {

      let oldThis = this;
      this.STEAM_CLIENT.on('friendsList', function () {
        oldThis.STEAM_CLIENT.chat.setSessionActiveGroups([17053990], async function (err, result) {
          let membersBase64 = [];

          result.chat_room_groups[17053990].members.forEach(member => {
            if(oldThis.BOT_ACCOUNT_ID ==  member.steamid.accountid){
              return;
            }
            membersBase64.push({base64: member.steamid.getSteamID64(), accountid: member.steamid.accountid});
          });

          let players = (await GetMembersNames(oldThis.STEAM_API_KEY, membersBase64.map((member) => member.base64))).data.response.players;

          players.forEach(player => {
            let tempMemberBase64 = membersBase64.find((member) => member.base64 == player.steamid);
            oldThis.ALL_MEMBERS.push({accountid: tempMemberBase64.accountid, personaname: player.personaname, steamid64 : player.steamid});
          });
        });
      });

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

      return this;
    },
    Mention: async function () {
        try {
            var result = (await GetSenderNickName(this.STEAM_API_KEY, this.STEAM_ID_SENDER_BASE64)).data;
        } catch (error) {
            console.error("Error on get player name.");
        }
      return `[mention=${this.STEAM_ID_SENDER.accountid}]@${result.response.players[0].personaname}[/mention]`;  
    },
    MentionAll: function () {
      let mentionAllMembers = "";

      this.ALL_MEMBERS.forEach(member => {
        mentionAllMembers = mentionAllMembers + `[mention=${member.accountid}]@${member.personaname}[/mention] `
      });

      return mentionAllMembers;
    },
    MentionOnline: async function() {
      let mentionOnlineMembers = "";

      // Vai buscar todas as informações (novamente) dos jogadores, para ver quais estão online!
      let players = (await GetMembersNames(this.STEAM_API_KEY, this.ALL_MEMBERS.map((member) => member.steamid64))).data.response.players;


      players.forEach(player => {

        // Caso o seu personastate seja diferente de 0, significa que não está offline, logo guardamos os valores e envia-mos as mensagens;
        if(player.personastate != 0){
          let tempMemberBase64 = this.ALL_MEMBERS.find((member) => member.steamid64 == player.steamid);

          mentionOnlineMembers = mentionOnlineMembers + `[mention=${tempMemberBase64.accountid}]@${player.personaname}[/mention] `;
        }

      });
      

      return mentionOnlineMembers;
    },
    GetFileText: function(filePath) {
      let messageToRead = processLineByLine(filePath);

      return messageToRead;
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
      this.STEAM_CLIENT.chat.on("chatMessage", ({ chat_group_id, chat_id, steamid_sender, message, server_timestamp, mentions }) => {
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

            this.LAST_MESSAGE = GetLastMessageData(this.STEAM_ID_SENDER_BASE64, server_timestamp, selectEvent.commandName, timeOutCalculated / 1000);
            setTimeout(() => {
              selectEvent.commandCallback(message);
            }, timeOutCalculated);
          }
        }
      );
      return this;
    },
  };
};
