const EXPRESS = require('express');
const BODY_PARSE = require('body-parser');

function setupSomethingExtra(arguments) {
	arguments.client.STEAM_CLIENT.chat.sendChatMessage(arguments.groupid, arguments.chatid, arguments.message);
}

function SetupReport(groupid, chatid, client, reportStatus, reportArguments){
	
	var message = "/pre ";
	if(reportStatus == 0){
		client.MentionOnline().then(function (result){
			client.STEAM_CLIENT.chat.sendChatMessage(groupid, chatid, result);
		});
		

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

		// Como vai enviar uma segunda mensagem (para conseguir enviar com o /pre), com 1 timeout de 4000
		setTimeout(setupSomethingExtra, 4000, {
			client : client,
			groupid: groupid,
			chatid: chatid,
			message: message,
		});


	} else {
		// Como nos reports resolvidos, não vai dar mentions, não é necessário colocar um timeout;
		message = message + 
			"----------- REPORT RESOLVIDO -----------\n" +
			"ID do Report: " + reportArguments.reportID + "\n" + 
			"Staff que Resolveu: " + reportArguments.reportStaffName + "\n" + 
			"----------- REPORT RESOLVIDO -----------\n";
		
		client.STEAM_CLIENT.chat.sendChatMessage(groupid, chatid, message);
	}
}

module.exports = ({port, client}) => {
	const API = EXPRESS();
	API.use(BODY_PARSE.urlencoded({ extended: true }));
	
	/*
		Comandos utilizados para testar o as mensagens:
		- Enviar um report novo: curl -X POST http://localhost:8080/sendReport -d "reportStatus=0" -d "serverName=[Agency PT'Fun] Portugal Sotaos | !stickers/!ws/!knife/!gloves - Waaclive.com" -d "serverIP=185.113.141.11:27029" -d "reportID=1" -d "reportQueixinhasName=O Queixinhas" -d "reportQueixinhasSteamID=STEAMID_DO_QUEIXINHAS" -d "reportAlvoName=O Alvo" -d "reportAlvoSteamID=STEAMID_DO_ALVO" -d "reportReason=Ele chamou-me burro"
	
		- Enviar que um report foi resolvido: curl -X POST http://localhost:8080/sendReport -d "reportStatus=1" -d "reportID=1" -d "reportStaffName=O Staff Genial"
	*/
	
	API.post('/sendReport', (req, res) => {
		console.log("------ DEBUG CURL POST REQUEST ---");
		console.log('Got body:', req.body);
	
		/* 
			Valores de reqd.body.reportStatus:
			- 0 -> Report realizado agora;
			- 1 -> Report resolvido;
		*/
		if(req.body.reportStatus == 0){
		
			// Vai enviar um report, para a sala correta, tendo os dados necessários;
			SetupReport("17053990", "56943144", client, req.body.reportStatus, {
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

			SetupReport("17053990", "56943144", client, req.body.reportStatus, {
				reportID: req.body.reportID,
				reportStaffName: req.body.reportStaffName
			});
		}

		res.sendStatus(200);
		// Falta colocar aqui para enviar a mensagem steam correspondente;
	});
	
	API.listen(port, () => console.log(`Started server at http://localhost:${port}!`));
};