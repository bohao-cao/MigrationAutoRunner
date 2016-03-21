var _= require('lodash'); 
var sql = require('mssql');
var fs = require('fs');

module.exports = function(app){
	app.get('/allDatabases/:server/:userName/:password', function(req, res){
		if(process.platform =='darwin'){
			setTimeout(function(){
				return res.send([{name:'A'},{name:'B'},{name:'C'}]);
			}, 1000);
			//return res.send([);
		}

		var config = {
			server: req.params.server,
			user: req.params.userName,
			password: req.params.password,
		}

		sql.connect(config)
		.then(function(){
			var req = new sql.Request();
			req.query('SELECT name FROM master.dbo.sysdatabases where name NOT IN (\'master\', \'tempdb\', \'model\', \'msdb\')')
			.then(function(recordset){
				console.log('send res:' + recordset);
				res.send(recordset);
			})
		})
		.catch(function(err){
			res.status(400).send(err.message);
		});		
		
	});

	app.post('/connectionInfo', function(req, res){

		var connectionFile = 'connectionInfo.json';
		var connectionInfo = {
			profileName: req.body.profileName,
			server: req.body.server,
			userName: req.body.userName,
			password: req.body.password,
			database: req.body.database
		};

		fs.exists(connectionFile, (exists)=>{
			if(exists){
				fs.appendFile(connectionFile, JSON.stringify(connectionInfo), function(err){
					if(err){
						res.status(500).send(err);
					}
					
					else
						res.status(200).send();
				})
			}
			else{
				fs.writeFile(connectionFile, JSON.stringify(connectionInfo), function(err){
					if(err)
						cres.status(500).send(err);
					else
						res.status(200).send();
				})
			}
		})
		

	});


};