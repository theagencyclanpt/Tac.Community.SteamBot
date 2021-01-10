require("dotenv/config");
const API = require('./modules/api-module');
const ASSETS_PATH = require('path').resolve(__dirname, "./assets/");
const CLIENT_MANAGEMENT = require("./modules/client-module")({
  accountName: process.env.ACCOUNT_NAME,
  password: process.env.ACCOUNT_PASSWORD,
  steamDevKey: process.env.STEAM_API_KEY,
  botAccountId: process.env.BOT_ACCOUNT_ID
});



//console.log(process.env.BOT_ACCOUNT_ID);

CLIENT_MANAGEMENT
	.SetCustomState({game: "!help para Ajuda", state: CLIENT_MANAGEMENT.STEAM_USER.EPersonaState.Online})
	.Init()
	.SetTimeOut(4)
	.ChatGroupManagement();

CLIENT_MANAGEMENT.AddCommand({
	commandName: "tolo", 
	commandDescription: "Frist Command", 
	commandTimeOut: 10,
	commandCallback: async function(){
		let mentionTag = await CLIENT_MANAGEMENT.Mention();
		CLIENT_MANAGEMENT.Answer("/command tolo resposta " + mentionTag);
	}});

CLIENT_MANAGEMENT.AddCommand({
	commandName: "!one", 
	commandDescription: "Command One", 
	commandCallback: async function(){
		let mentionTag = await CLIENT_MANAGEMENT.Mention();
		CLIENT_MANAGEMENT.Answer("/command one " + mentionTag);
	}});

CLIENT_MANAGEMENT.AddCommand({
	commandName: "!help", 
	commandDescription: "Help Command", 
	commandCallback: async function(){
		let messageToRead = await CLIENT_MANAGEMENT.GetFileText(ASSETS_PATH + '/commands/help.ini');
		CLIENT_MANAGEMENT.Answer(messageToRead);
	}});

CLIENT_MANAGEMENT.AddCommand({
	commandName: "!commandsMod", 
	commandDescription: "Commands for Moderator", 
	commandCallback: async function(){
		let messageToRead = await CLIENT_MANAGEMENT.GetFileText(ASSETS_PATH + '/commands/commandsMod.ini');
		CLIENT_MANAGEMENT.Answer(messageToRead);
	}});

CLIENT_MANAGEMENT.AddCommand({
	commandName: "!testOnline", 
	commandDescription: "Commands for OnlineMembers", 
	commandCallback: async function(){
		let variable = await CLIENT_MANAGEMENT.MentionOnline();
		console.log(variable);
		//let messageToRead = await CLIENT_MANAGEMENT.GetFileText(ASSETS_PATH + '/commands/commandsMod.ini');
		//CLIENT_MANAGEMENT.Answer(messageToRead);
	}});


CLIENT_MANAGEMENT.AddCommand({
	commandName: "!two", 
	commandDescription: "Command Two", 
	commandCallback: async function(){
		CLIENT_MANAGEMENT.Answer("Boa noite juventude." + CLIENT_MANAGEMENT.MentionAll());
	}});
	
API({port: process.env.API_PORT, client: CLIENT_MANAGEMENT});



return;