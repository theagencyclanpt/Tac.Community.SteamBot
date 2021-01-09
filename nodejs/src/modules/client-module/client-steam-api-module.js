const AXIOS = require('axios').default;

module.exports = ({steamApiKey}) => {
    return {
        SteamApiBaseUrl: 'http://api.steampowered.com',
        SteamApiKey: steamApiKey,
        GetPersonanameFromUserIdBase64: async function({userIdBase64}){
            try {
                let result = (await AXIOS.get(`${this.SteamApiBaseUrl}/ISteamUser/GetPlayerSummaries/v0002/?key=${this.SteamApiKey}&steamids=${userIdBase64}`)).data;

                return result.response.players[0].personaname;
            } catch (error) {
                console.error("Error on get player name.");
            }
        }
    }
};