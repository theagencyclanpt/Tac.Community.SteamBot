const EXPRESS = require('express');
const BODY_PARSE = require('body-parser');

module.exports = ({port}) => {
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

	return {
		Start: function () {
			API.listen(port, () => console.log(`Started server at http://localhost:${port}!`));
		}
	}
};