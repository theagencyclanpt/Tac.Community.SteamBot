//Initial
require("dotenv").config();
const CLIENT_MANAGEMENT = require("./modules/client-management")({
  accountName: process.env.ACCOUNT_NAME,
  password: process.env.ACCOUNT_PASSWORD,
  steamDevKey: process.env.STEAM_API_KEY
});

CLIENT_MANAGEMENT.SetCustomState({game: "ESCRAVO", state: CLIENT_MANAGEMENT.STEAM_USER.EPersonaState.Online});

CLIENT_MANAGEMENT.ChatGroupManagement(async (message)=> {
	switch (message) {
		case '/Test':
			var mentionTag = await CLIENT_MANAGEMENT.Mention();
			CLIENT_MANAGEMENT.Answer("/Test " + mentionTag);
			break;
	}
});