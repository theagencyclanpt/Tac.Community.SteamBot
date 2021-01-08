require("dotenv").config();
const CLIENT_MANAGEMENT = require("./modules/client-management")({
  accountName: process.env.ACCOUNT_NAME,
  password: process.env.ACCOUNT_PASSWORD,
  steamDevKey: process.env.STEAM_API_KEY,
  botAccountId: 897355269
});

CLIENT_MANAGEMENT.SetCustomState({game: "ESCRAVO", state: CLIENT_MANAGEMENT.STEAM_USER.EPersonaState.Online});
CLIENT_MANAGEMENT.SetTimeOut(1);
CLIENT_MANAGEMENT.Init();

CLIENT_MANAGEMENT.AddCommand({
	commandName: "/test", 
	commandDescription: "Frist Command", 
	commandTimeOut: 5,
	commandCallback: async function(){
		let mentionTag = await CLIENT_MANAGEMENT.Mention();
		CLIENT_MANAGEMENT.Answer("/command example " + mentionTag);
	}});

CLIENT_MANAGEMENT.AddCommand({
	commandName: "/one", 
	commandDescription: "Command One", 
	commandCallback: async function(){
		let mentionTag = await CLIENT_MANAGEMENT.Mention();
		CLIENT_MANAGEMENT.Answer("/command one " + mentionTag);
	}});

CLIENT_MANAGEMENT.AddCommand({
	commandName: "/two", 
	commandDescription: "Command Two", 
	commandCallback: async function(){
		CLIENT_MANAGEMENT.Answer("Boa noite juventude." + CLIENT_MANAGEMENT.MentionAll());
	}});


CLIENT_MANAGEMENT.ChatGroupManagement();

