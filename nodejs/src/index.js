require("dotenv/config");
const ASSETS_PATH = require('path').resolve(__dirname, "./assets/");
const CLIENT_MANAGEMENT = require("./modules/client-management")({
  accountName: process.env.ACCOUNT_NAME,
  password: process.env.ACCOUNT_PASSWORD,
  steamDevKey: process.env.STEAM_API_KEY,
  botAccountId: process.env.BOT_ACCOUNT_ID
});


console.log(process.env.BOT_ACCOUNT_ID);

return;

// index.js
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

/*
	Comandos utilizados para testar o as mensagens:
	- Enviar um report novo: curl -X POST http://localhost:8080/sendReport -d "reportStatus=0" -d "serverName=[Agency PT'Fun] Portugal Sotaos | !stickers/!ws/!knife/!gloves - Waaclive.com" -d "serverIP=185.113.141.11:27029" -d "reportID=1" -d "reportQueixinhasName=O Queixinhas" -d "reportQueixinhasSteamID=STEAMID_DO_QUEIXINHAS" -d "reportAlvoName=O Alvo" -d "reportAlvoSteamID=STEAMID_DO_ALVO" -d "reportReason=Ele chamou-me burro"

	- Enviar que um report foi resolvido: curl -X POST http://localhost:8080/sendReport -d "reportStatus=1" -d "reportID=1" -d "reportStaffName=O Staff Genial"
*/

app.post('/sendReport', (req, res) => {
	console.log("------ DEBUG CURL POST REQUEST ---");
	console.log('Got body:', req.body);

	/* 
		Valores de reqd.body.reportStatus:
		- 0 -> Report realizado agora;
		- 1 -> Report resolvido;
	*/
	if(req.body.reportStatus == 0){
		console.log("--------- NOVO REPORT ---------");
		console.log('Server Name: ', req.body.serverName);
		console.log('Server IP: ', req.body.serverIP);
		console.log('ID do Report: ', req.body.reportID);
		console.log('Nome do Queixinhas: ', req.body.reportQueixinhasName);
		console.log('SteamID do Queixinhas: ', req.body.reportQueixinhasSteamID);
		console.log('Nome do Alvo: ', req.body.reportAlvoName);
		console.log('SteamID do Alvo: ', req.body.reportAlvoSteamID);
		console.log('Razão do Report: ', req.body.reportReason);
		console.log("-------------------------------");

	} else {
		console.log("--------- REPORT RESOLVIDO ---------");
		console.log('ID do Report: ', req.body.reportID);
		console.log('Nome do Staff que resolveu: ', req.body.reportStaffName);
		console.log("------------------------------------");
	}
	
	res.sendStatus(200);
	
	// Falta colocar aqui para enviar a mensagem steam correspondente;

});

app.listen(8080, () => console.log(`Started server at http://localhost:8080!`));

CLIENT_MANAGEMENT
	.SetCustomState({game: "ESCRAVO", state: CLIENT_MANAGEMENT.STEAM_USER.EPersonaState.Online})
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
	commandName: "!two", 
	commandDescription: "Command Two", 
	commandCallback: async function(){
		CLIENT_MANAGEMENT.Answer("Boa noite juventude." + CLIENT_MANAGEMENT.MentionAll());
	}});