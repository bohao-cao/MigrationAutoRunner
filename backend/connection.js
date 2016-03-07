var _= require('lodash'); 

module.exports = function(app){
	app.get('/allDatabases/:server/:userName/:password', function(req, res){


		var ret = ['A','B','C'];
		console.log('send res:' + ret);
		res.send(ret);
	});


};