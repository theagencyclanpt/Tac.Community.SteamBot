const EXPRESS = require('express');
const BODY_PARSE = require('body-parser');

function setupSomethingExtra(arguments) {
	arguments.client.STEAM_CLIENT.chat.sendChatMessage(arguments.groupid, arguments.chatid, arguments.message);
}

function SetupReport(groupid, chatid, client, reportStatus, reportArguments){
	
	var message = "/quote ";
	if(reportStatus == 0){
		
		/*client.MentionOnline().then(function (result){
			client.STEAM_CLIENT.chat.sendChatMessage(groupid, chatid, result);
		});*/
		

		// Formata a mensagem em questão;
		message = message +
		"-------------- NOVO REPORT -------------\n" +
		"ID do Report: " + reportArguments.reportID + "\n" + 
		"Nome do Servidor: " + reportArguments.serverName + "\n" + 
		"IP do Servidor: " + reportArguments.serverIP + "\n" + 
		"Queixinhas: " + reportArguments.reportQueixinhasName + " (" + reportArguments.reportQueixinhasSteamID + ")\n" + 
		"Alvo: " + reportArguments.reportAlvoName + " (" + reportArguments.reportAlvoSteamID + ")\n" + 
		"Razão: " + reportArguments.reportReason + "\n" +
		"----------------------------------------\n";

		client.STEAM_CLIENT.chat.sendChatMessage(groupid, chatid, message);


	} else {
		// Como nos reports resolvidos, não vai dar mentions, não é necessário colocar um timeout;
		message = message + 
			"----------- REPORT RESOLVIDO -----------\n" +
			"ID do Report: " + reportArguments.reportID + "\n" + 
			"Staff que Resolveu: " + reportArguments.reportStaffName + "\n" + 
			"----------------------------------------\n";
		
		client.STEAM_CLIENT.chat.sendChatMessage(groupid, chatid, message);
	}
}

module.exports = ({port, client}) => {
	const API = EXPRESS();
	API.use(BODY_PARSE.urlencoded({ extended: true }));
	API.use(BODY_PARSE.json());
	
	/*
		Comandos utilizados para testar o as mensagens:
		- Enviar um report novo: curl -X POST http://51.77.203.42:8080/sendReport -d "reportStatus=0" -d "serverName=[Agency PT'Fun] Portugal Sotaos | !stickers/!ws/!knife/!gloves - Waaclive.com" -d "serverIP=185.113.141.11:27029" -d "reportID=1" -d "reportQueixinhasName=O Queixinhas" -d "reportQueixinhasSteamID=STEAMID_DO_QUEIXINHAS" -d "reportAlvoName=O Alvo" -d "reportAlvoSteamID=STEAMID_DO_ALVO" -d "reportReason=Ele chamou-me burro"
	
		- Enviar que um report foi resolvido: curl -X POST http://51.77.203.42:8080/sendReport -d "reportStatus=1" -d "reportID=1" -d "reportStaffName=O Staff Genial"

		- Comprar VIP: curl -X POST http://51.77.203.42:8080/comprarVIP -d "playerName=O Zé Manel" -d "steamID=STEAM_ID_DO_ZE_MANEL" -d "tipoPagamento=Skins CS:GO"
	*/
	
	API.post('/sendReport', (req, res) => {
	
		/* 
			Valores de reqd.body.reportStatus:
			- 0 -> Report realizado agora;
			- 1 -> Report resolvido;
		*/
		if(req.body.reportStatus == 0){
			SetupReport("845759", "57202892", client, req.body.reportStatus, {
				serverName: req.body.serverName,
				serverIP: req.body.serverIP,
				reportID: req.body.reportID,
				reportQueixinhasName: req.body.reportQueixinhasName,
				reportQueixinhasSteamID: req.body.reportQueixinhasSteamID,
				reportAlvoName: req.body.reportAlvoName,
				reportAlvoSteamID: req.body.reportAlvoSteamID,
				reportReason: req.body.reportReason
			});
	
		} else {
			SetupReport("845759", "57202892", client, req.body.reportStatus, {
				reportID: req.body.reportID,
				reportStaffName: req.body.reportStaffName
			});
		}

		res.sendStatus(200);
		// Falta colocar aqui para enviar a mensagem steam correspondente;
	});

	API.post('/comprarVip', (req, res) => {

		// Formata a mensagem em questão;
		message = "/quote -------------- NOVA COMPRA DE VIP -------------\n" +
		"Nome do Jogador: " + req.body.playerName + "\n" + 
		"Perfil do Jogador: http://steamcommunity.com/profiles/" + req.body.steamID + "\n" + 
		"Tipo de Pagamento: " + req.body.tipoPagamento + "\n" + 
		"----------------------------------------\n";

		client.STEAM_CLIENT.chat.sendFriendMessage("[U:1:52853389]", message);
		
		res.sendStatus(200);
	});

	API.post('/novaCandidatura', (req, res) => {

		// Formata a mensagem em questão;
		message = "/quote -------------- NOVA CANDIDATURA -------------\n" +
		"- Nome do Jogador: " + req.body.profileName + "\n" + 
		"- Perfil do Jogador: http://steamcommunity.com/profiles/" + req.body.profileSteam + "\n" + 
		"- Idade: " + req.body.profilePlayerAge + "\n" + 
		"- Tempo Jogado (Horas Aproximadas): " + Math.round((req.body.profileTimePlayed) / 3600)  + "\n" +
		"- Penalizações: " + req.body.profileNumBans + " Bans, " + req.body.profileNumMutes + " Mutes, " + req.body.profileNumGags + " Gags\n" +
		"- Descrição: " + "\n" + req.body.candidaturaDescription + "\n" +
		"----------------------------------------\n";

		client.STEAM_CLIENT.chat.sendChatMessage("14400895", "59841566", message);

		res.sendStatus(200);
	});

	

	API.get('/test', (req, res) => {
		console.log("------------- DEBUG CURL GET REQUEST ----------------");

		
		
		res.sendStatus(200);
	});
	
	API.listen(port, () => console.log(`Started server at http://localhost:${port}!`));
};