var _= require('lodash'); 
var sql = require('mssql');

module.exports = function(app){
	app.get('/allDatabases/:server/:userName/:password', function(req, res){
		if(process.platform =='darwin')
			res.send(['A','B','C']);



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
			console.log(err);
			res.status(400).send(err.message);
		});
		
		var ret = ['A','B','C'];
		
		
	});


};