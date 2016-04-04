var _= require('lodash'); 
var sql = require('mssql');
var fs = require('fs');
//On windows the forward slash might not work
var ConnProfile = require('./model_connProfile.js');

module.exports = function(app){
	var connectionFile = 'connectionInfo.json';

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


	//return will be in a format of { "profileName": x, "_id": y}
	app.get('/allConnectionInfo', function(req, res){
		
		var query = ConnProfile.find({}).select('profileName');

		query.exec(function(err, data){
			if(err)
				return res.status(500).send(err);
			else{
				//var ret = _.map(data, "profileName");
				return res.status(200).send(data);
			}
		});
		
	});

	app.get('/connectionInfoDetail/:id', function(req,res){
		ConnProfile.findById(req.params.id, function(err, data){
			if(err)
				return res.status(404).send(err);
			else{
				return res.status(200).send(data);
			}
		})
	})

	app.post('/connectionInfo', function(req, res){

		var connectionInfo = {
			profileName: req.body.profileName,
			server: req.body.server,
			userName: req.body.userName,
			password: req.body.password,
			database: req.body.database
		};

		var newConn = new ConnProfile(connectionInfo);
		newConn.save(function(err){
			if(err){
				return res.status(400).send(err);
			}
			else
				return res.status(200).send();
		})
	});

	app.delete('/connectionInfo/:name', function(req,res){
		ConnProfile.remove({profileName: req.params.name}, function(err, data){
			if(err)
				return res.status(500).send(err);
			else{
				return res.status(200).send();
			}
		});
	});


};